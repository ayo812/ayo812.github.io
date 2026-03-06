param(
    [string]$PublicationUrl = "https://yoavgotmail.substack.com",
    [string]$WatchlistPath = "config/watchlist.json",
    [string]$OutputPath = "data/dashboard.json",
    [int]$MaxPages = 4,
    [int]$WatchlistPages = 2
)

$ErrorActionPreference = "Stop"

function Ensure-Directory {
    param([string]$Path)

    $directory = Split-Path -Parent $Path
    if (-not [string]::IsNullOrWhiteSpace($directory) -and -not (Test-Path $directory)) {
        New-Item -ItemType Directory -Path $directory -Force | Out-Null
    }
}

function Get-Text {
    param([string]$Url)

    (Invoke-WebRequest -Uri $Url -UseBasicParsing).Content
}

function Get-Json {
    param([string]$Url)

    (Get-Text -Url $Url) | ConvertFrom-Json
}

function Get-EasternTime {
    param([datetime]$UtcDate)

    $zone = [System.TimeZoneInfo]::FindSystemTimeZoneById("Eastern Standard Time")
    [System.TimeZoneInfo]::ConvertTimeFromUtc($UtcDate.ToUniversalTime(), $zone)
}

function Get-ShortDate {
    param([datetime]$Date)

    $Date.ToString("MMM d, yyyy")
}

function Get-SafeText {
    param([string]$Value)

    if ([string]::IsNullOrWhiteSpace($Value)) {
        return ""
    }

    (($Value -replace "<[^>]+>", " ") -replace "\s+", " " -replace "&amp;", "&" -replace "&quot;", '"' -replace "&#39;", "'" -replace "&nbsp;", " ").Trim()
}

function Get-PreloadsObject {
    param([string]$Html)

    $match = [regex]::Match($Html, '(?s)window\._preloads\s*=\s*JSON\.parse\("(?<payload>(?:\\.|[^"\\])*)"\)')
    if (-not $match.Success) {
        throw "Unable to find Substack preloads payload."
    }

    $decoded = ConvertFrom-Json ('"' + $match.Groups["payload"].Value + '"')
    $decoded | ConvertFrom-Json
}

function Resolve-Profile {
    param([string]$Handle)

    $trimmed = $Handle.Trim().TrimStart("@")
    $html = Get-Text -Url ("https://substack.com/@{0}/notes" -f $trimmed)
    $preloads = Get-PreloadsObject -Html $html
    $profile = $preloads.profile
    $publicationUser = $profile.publicationUsers | Select-Object -First 1
    $publication = $publicationUser.publication

    [PSCustomObject]@{
        Handle = $profile.handle
        ProfileId = $profile.id
        Name = $profile.name
        Bio = $profile.bio
        PublicationName = $publication.name
        PublicationSubdomain = $publication.subdomain
        PublicationUrl = if ($publication.subdomain) { "https://$($publication.subdomain).substack.com" } else { "https://substack.com/@$trimmed" }
        LogoUrl = $publication.logo_url
        CoverUrl = if ($profile.theme -and $profile.theme.cover_image) { $profile.theme.cover_image.url } else { $null }
        RankingDetail = $publication.rankingDetail
    }
}

function Get-ActivityFeed {
    param(
        [int]$ProfileId,
        [int]$Pages
    )

    $items = New-Object System.Collections.Generic.List[object]
    $cursor = $null

    for ($page = 0; $page -lt $Pages; $page++) {
        $url = "https://substack.com/api/v1/reader/feed/profile/$ProfileId"
        if ($cursor) {
            $url = "{0}?cursor={1}" -f $url, [uri]::EscapeDataString($cursor)
        }

        $response = Get-Json -Url $url
        foreach ($item in $response.items) {
            $items.Add($item)
        }

        if (-not $response.nextCursor) {
            break
        }

        $cursor = $response.nextCursor
    }

    $items
}

function Get-FeedItems {
    param([string]$BaseUrl)

    $rss = [xml](Get-Text -Url ($BaseUrl.TrimEnd("/") + "/feed"))
    foreach ($item in $rss.rss.channel.item) {
        [PSCustomObject]@{
            Title = $item.title.'#cdata-section'
            Link = [string]$item.link
            PubDate = [string]$item.pubDate
            Description = $item.description.'#cdata-section'
        }
    }
}

function Get-Tokens {
    param([string]$Text)

    $stopWords = @(
        "a", "about", "after", "again", "all", "also", "an", "and", "are", "because", "below", "between",
        "click", "does", "for", "from", "give", "have", "here", "into", "just",
        "like", "more", "once", "post", "read", "should", "than", "that", "the", "their",
        "them", "they", "this", "what", "when", "where", "with", "you", "your",
        "will", "went", "while", "would", "there", "every", "still", "fresh",
        "favorite", "getting", "here's", "love", "off", "started", "week", "weeks", "why", "yes"
    )

    if ([string]::IsNullOrWhiteSpace($Text)) {
        return @()
    }

    $matches = [regex]::Matches($Text.ToLowerInvariant(), "[a-z][a-z0-9']{2,}")
    $tokens = foreach ($match in $matches) {
        $word = $match.Value.Trim("'")
        if ($word.Length -gt 4 -and $word.EndsWith("s")) {
            $word = $word.Substring(0, $word.Length - 1)
        }

        if ($stopWords -notcontains $word) {
            $word
        }
    }

    $tokens
}

function Get-TopTopics {
    param(
        [object[]]$Items,
        [int]$Take = 6
    )

    $counts = @{}
    foreach ($item in $Items) {
        foreach ($token in (Get-Tokens -Text $item)) {
            if (-not $counts.ContainsKey($token)) {
                $counts[$token] = 0
            }
            $counts[$token] += 1
        }
    }

    @(
        $counts.GetEnumerator() |
            Sort-Object Value -Descending |
            Select-Object -First $Take |
            ForEach-Object {
                [PSCustomObject]@{
                    label = (Get-Culture).TextInfo.ToTitleCase($_.Key)
                    count = $_.Value
                }
            }
    )
}

function Get-FormatLabel {
    param([string]$Body)

    if ([string]::IsNullOrWhiteSpace($Body)) {
        return "Attachment-led"
    }

    if ($Body -match "\?") {
        return "Question-led"
    }

    if ($Body.Length -gt 180) {
        return "Story-led"
    }

    if ($Body -match "(?i)read|below|posted|give it a read") {
        return "Teaser-led"
    }

    "One-liner"
}

function Get-ActivityNote {
    param([object]$Item)

    if ($Item.type -ne "comment" -or -not $Item.comment) {
        return $null
    }

    if ($Item.context.type -notin @("note", "comment_restack")) {
        return $null
    }

    $attachment = $null
    if ($Item.comment.attachments -and $Item.comment.attachments.Count -gt 0) {
        $attachment = $Item.comment.attachments[0]
    }

    $body = if ([string]::IsNullOrWhiteSpace($Item.comment.body)) {
        if ($attachment -and $attachment.post) {
            "Attached: $($attachment.post.title)"
        } elseif ($attachment) {
            "Attachment-only note"
        } else {
            "Short note"
        }
    } else {
        $Item.comment.body
    }

    $signal = [int]$Item.comment.reaction_count + ([int]$Item.comment.restacks * 2) + [int]$Item.comment.children_count
    $date = Get-Date $Item.comment.date
    $eastern = Get-EasternTime -UtcDate $date

    [PSCustomObject]@{
        Date = $date
        DateLabel = Get-ShortDate -Date $eastern
        TimeLabel = $eastern.ToString("ddd h:mm tt 'ET'")
        Body = $body
        RawBody = $Item.comment.body
        Format = Get-FormatLabel -Body $Item.comment.body
        Signal = $signal
        ScoreLabel = ("{0} signal" -f $signal)
        PostTitle = if ($attachment -and $attachment.post) { $attachment.post.title } else { $null }
        PostUrl = if ($attachment -and $attachment.post) { $attachment.post.canonical_url } else { $null }
        Actor = if ($Item.context.users.Count -gt 0) { $Item.context.users[0].name } else { $null }
    }
}

function Get-ActivityPost {
    param([object]$Item)

    if ($Item.type -ne "post" -or -not $Item.post) {
        return $null
    }

    $date = Get-Date $Item.post.post_date
    $eastern = Get-EasternTime -UtcDate $date
    $score = [int]$Item.post.reaction_count + ([int]$Item.post.restacks * 2) + [int]$Item.post.comment_count
    $theme = (Get-TopTopics -Items @("$($Item.post.title) $($Item.post.subtitle)") -Take 1 | Select-Object -First 1).label

    [PSCustomObject]@{
        Title = $Item.post.title
        Url = $Item.post.canonical_url
        Date = $date
        DateLabel = Get-ShortDate -Date $eastern
        Theme = if ($theme) { $theme } else { "General" }
        Score = $score
        Subtitle = $Item.post.subtitle
    }
}

function Get-TopSlots {
    param(
        [datetime[]]$Dates,
        [int]$Take = 3
    )

    $groups = @{}
    foreach ($date in $Dates) {
        $local = Get-EasternTime -UtcDate $date
        $key = "{0}|{1}" -f $local.ToString("dddd"), $local.ToString("h tt")
        if (-not $groups.ContainsKey($key)) {
            $groups[$key] = 0
        }
        $groups[$key] += 1
    }

    @(
        $groups.GetEnumerator() |
            Sort-Object Value -Descending |
            Select-Object -First $Take |
            ForEach-Object {
                $parts = $_.Key.Split("|")
                [PSCustomObject]@{
                    title = "{0} {1} ET" -f $parts[0], $parts[1]
                    count = $_.Value
                }
            }
    )
}

function Get-AverageCadence {
    param([datetime[]]$Dates)

    $ordered = $Dates | Sort-Object
    if ($ordered.Count -lt 2) {
        return "n/a"
    }

    $total = 0.0
    for ($index = 1; $index -lt $ordered.Count; $index++) {
        $total += ($ordered[$index] - $ordered[$index - 1]).TotalDays
    }

    "{0:N1} days" -f ($total / ($ordered.Count - 1))
}

function Build-SuggestionDraft {
    param(
        [object]$Post,
        [string]$Style
    )

    $subtitle = if ([string]::IsNullOrWhiteSpace($Post.Subtitle)) { "a new piece on Yoav Got Mail" } else { $Post.Subtitle.TrimEnd(".") }

    switch ($Style) {
        "Question-led" {
            $draft = "Would you answer this differently after reading $($Post.Title)? I just wrote about $subtitle. Read it here: $($Post.Url)"
        }
        "Story-led" {
            $draft = "This one started from a detail I could not shake, and it turned into $($Post.Title). I wrote about $subtitle. Read it here: $($Post.Url)"
        }
        default {
            $draft = "New on Yoav Got Mail: $($Post.Title). $subtitle. Read it here: $($Post.Url)"
        }
    }

    if ($draft.Length -gt 280) {
        return $draft.Substring(0, 277) + "..."
    }

    $draft
}

Ensure-Directory -Path $OutputPath

$watchlistConfig = if (Test-Path $WatchlistPath) {
    Get-Content $WatchlistPath -Raw | ConvertFrom-Json
} else {
    [PSCustomObject]@{ handles = @() }
}

$publicationHandle = ([uri]$PublicationUrl).Host.Split(".")[0]
$profile = Resolve-Profile -Handle $publicationHandle
$feedItems = Get-FeedItems -BaseUrl $PublicationUrl
$activityItems = Get-ActivityFeed -ProfileId $profile.ProfileId -Pages $MaxPages

$activityPosts = @($activityItems | ForEach-Object { Get-ActivityPost -Item $_ } | Where-Object { $_ })
$activityNotes = @($activityItems | ForEach-Object { Get-ActivityNote -Item $_ } | Where-Object { $_ -and $_.Actor -eq $profile.Name })

$postByUrl = @{}
foreach ($post in $activityPosts) {
    if (-not $postByUrl.ContainsKey($post.Url)) {
        $postByUrl[$post.Url] = $post
    }
}

$rssPosts = foreach ($item in $feedItems) {
    $url = $item.Link
    $date = Get-Date $item.PubDate
    $eastern = Get-EasternTime -UtcDate $date
    $match = if ($postByUrl.ContainsKey($url)) { $postByUrl[$url] } else { $null }
    $topic = (Get-TopTopics -Items @("$($item.Title) $($item.Description)") -Take 1 | Select-Object -First 1).label
    $relatedNote = $activityNotes | Where-Object { $_.PostUrl -eq $url } | Sort-Object Date -Descending | Select-Object -First 1

    [PSCustomObject]@{
        title = $item.Title
        url = $url
        date = $date.ToString("o")
        dateLabel = Get-ShortDate -Date $eastern
        theme = if ($topic) { $topic } else { "General" }
        score = if ($match) { $match.Score } else { 0 }
        coverage = if ($relatedNote) { "Has note" } else { "Needs note" }
        subtitle = Get-SafeText -Value $item.Description
    }
}

$topicBreakdown = Get-TopTopics -Items ($rssPosts | ForEach-Object { "$($_.title) $($_.subtitle)" }) -Take 6


$watchlistProfiles = foreach ($entry in $watchlistConfig.handles) {
    if ($entry.profileId) {
        [PSCustomObject]@{
            Handle = if ($entry.handle) { $entry.handle } else { [string]$entry.profileId }
            ProfileId = [int]$entry.profileId
            Name = if ($entry.label) { $entry.label } else { if ($entry.handle) { $entry.handle } else { [string]$entry.profileId } }
        }
        continue
    }

    try {
        Resolve-Profile -Handle $entry.handle
    } catch {
        [PSCustomObject]@{
            Handle = $entry.handle
            ProfileId = $null
            Name = if ($entry.label) { $entry.label } else { $entry.handle }
        }
    }
}

$watchlistCards = New-Object System.Collections.Generic.List[object]
$watchlistNotes = New-Object System.Collections.Generic.List[object]

foreach ($watch in $watchlistProfiles) {
    if (-not $watch.ProfileId) {
        $watchlistCards.Add([PSCustomObject]@{
            name = $watch.Name
            meta = "Public profile could not be resolved"
            signalScore = 0
            topNotes = @("Check the handle in config/watchlist.json.")
        })
        continue
    }

    $items = Get-ActivityFeed -ProfileId $watch.ProfileId -Pages $WatchlistPages
    $notes = @($items | ForEach-Object { Get-ActivityNote -Item $_ } | Where-Object { $_ })
    foreach ($note in $notes) {
        $watchlistNotes.Add($note)
    }

    $topNotes = $notes | Sort-Object Signal -Descending | Select-Object -First 3
    $signal = ($topNotes | Measure-Object -Property Signal -Sum).Sum

    $watchlistCards.Add([PSCustomObject]@{
        name = $watch.Name
        meta = "{0} notes tracked" -f $notes.Count
        signalScore = [int]$signal
        topNotes = if ($topNotes.Count -gt 0) {
            @($topNotes | ForEach-Object {
                if ($_.Body.Length -gt 160) { $_.Body.Substring(0, 157) + "..." } else { $_.Body }
            })
        } else {
            @("No public notes found in the sampled pages.")
        }
    })
}

$formatGroups = @(
    $watchlistNotes |
        Group-Object Format |
        Sort-Object Count -Descending |
        Select-Object -First 4 |
        ForEach-Object {
            $detail = switch ($_.Name) {
                "Question-led" { "Lead with a question when you want replies." }
                "Story-led" { "Longer notes work when they open with a scene." }
                "Teaser-led" { "Directly promise the payoff and point to the post." }
                default { "Short punchy note format." }
            }

            [PSCustomObject]@{
                label = $_.Name
                count = $_.Count
                detail = $detail
            }
        }
)

$uncoveredPosts = $rssPosts | Where-Object { $_.coverage -eq "Needs note" } | Select-Object -First 2
$coveredPost = $rssPosts | Where-Object { $_.coverage -eq "Has note" } | Sort-Object score -Descending | Select-Object -First 1
$bestExternalFormats = @($formatGroups | Select-Object -First 2)
$suggestions = New-Object System.Collections.Generic.List[object]
$bestSlot = @(Get-TopSlots -Dates (($rssPosts | ForEach-Object { Get-Date $_.date })) -Take 1 | Select-Object -First 1)[0]

foreach ($post in $uncoveredPosts) {
    $style = if ($bestExternalFormats.Count -gt 0) { $bestExternalFormats[0].label } else { "Teaser-led" }
    $sourceLabels = if ($bestExternalFormats.Count -gt 0) { @($bestExternalFormats | ForEach-Object { $_.label }) } else { @("Teaser-led") }
    $suggestions.Add([PSCustomObject]@{
        headline = "Promote $($post.title) with a sharper hook"
        targetPost = $post.title
        format = $style
        reason = "This post has public activity but no attached note in the sampled feed. Use a direct hook to convert the article into a quick note entry point."
        bestTime = if ($bestSlot) { "Next $($bestSlot.title)" } else { "This week" }
        draft = Build-SuggestionDraft -Post ([PSCustomObject]@{ Title = $post.title; Subtitle = $post.subtitle; Url = $post.url }) -Style $style
        sources = $sourceLabels
    })
}

if ($coveredPost) {
    $style = if ($bestExternalFormats.Count -gt 1) { $bestExternalFormats[1].label } else { "Story-led" }
    $suggestions.Add([PSCustomObject]@{
        headline = "Resurface $($coveredPost.title) with a second-angle note"
        targetPost = $coveredPost.title
        format = $style
        reason = "This is one of your stronger posts by public engagement. A fresh note angle gives it another distribution pass without repeating the original teaser."
        bestTime = "Friday 9 AM ET"
        draft = Build-SuggestionDraft -Post ([PSCustomObject]@{ Title = $coveredPost.title; Subtitle = $coveredPost.subtitle; Url = $coveredPost.url }) -Style $style
        sources = @("Resurface strong archive")
    })
}

$strongestTheme = if ($topicBreakdown.Count -gt 0) { $topicBreakdown[0].label } else { "General" }
$topPost = $rssPosts | Select-Object -First 1
$suggestions.Add([PSCustomObject]@{
    headline = "Preview the next $strongestTheme piece before publish day"
    targetPost = if ($topPost) { $topPost.title } else { "Next issue" }
    format = "One-liner"
    reason = "Your feed already shows a rhythm. A preview note 24 hours ahead can turn regular readers into return visitors for the next send."
    bestTime = "Sunday 7 PM ET"
    draft = "New piece incoming on Yoav Got Mail tomorrow morning. If you like $($strongestTheme.ToLowerInvariant()) pieces with a personal angle, keep an eye out."
    sources = @("Cadence play")
})

$postDates = @($rssPosts | ForEach-Object { Get-Date $_.date })
$noteDates = @($activityNotes | ForEach-Object { $_.Date })
$postSlots = @(Get-TopSlots -Dates $postDates -Take 2)
$noteSlots = @(Get-TopSlots -Dates $noteDates -Take 2)
$calendar = New-Object System.Collections.Generic.List[object]

foreach ($slot in $postSlots) {
    $calendar.Add([PSCustomObject]@{
        title = $slot.title
        detail = "Primary send window. This is where the publication already has a visible rhythm."
    })
}

foreach ($slot in $noteSlots) {
    $calendar.Add([PSCustomObject]@{
        title = $slot.title
        detail = "Follow-up note window. Use it to extend the life of that week's post."
    })
}

$matchedNotes = ($rssPosts | Where-Object { $_.coverage -eq "Has note" }).Count
$metrics = @(
    [PSCustomObject]@{
        label = "Posts tracked"
        value = "$($rssPosts.Count)"
        detail = "Public RSS posts merged with public activity."
    },
    [PSCustomObject]@{
        label = "Notes tracked"
        value = "$($activityNotes.Count)"
        detail = "Public note activity found on your profile."
    },
    [PSCustomObject]@{
        label = "Note coverage"
        value = if ($rssPosts.Count -gt 0) { "{0:P0}" -f ($matchedNotes / $rssPosts.Count) } else { "0%" }
        detail = "$matchedNotes of $($rssPosts.Count) sampled posts have an attached note."
    },
    [PSCustomObject]@{
        label = "Post cadence"
        value = Get-AverageCadence -Dates $postDates
        detail = "Average gap between sampled newsletter posts."
    },
    [PSCustomObject]@{
        label = "Best post slot"
        value = $bestPublishingSlotText
        detail = "Most common publish window from the sampled posts."
    },
    [PSCustomObject]@{
        label = "Outside notes"
        value = "$($watchlistNotes.Count)"
        detail = "Public notes sampled from the watchlist."
    }
)

$noteHistory = @(
    $activityNotes |
        Sort-Object Date -Descending |
        Select-Object -First 6 |
        ForEach-Object {
            [PSCustomObject]@{
                postTitle = if ($_.PostTitle) { $_.PostTitle } else { "Standalone note" }
                dateLabel = $_.TimeLabel
                format = $_.Format
                scoreLabel = $_.ScoreLabel
                body = $_.Body
            }
        }
)

$bestPublishingSlotText = "n/a"
if (@($postSlots).Count -gt 0) {
    $bestPublishingSlotText = [string]$postSlots[0].PSObject.Properties['title'].Value
}

$bestNoteSlotText = "n/a"
if (@($noteSlots).Count -gt 0) {
    $bestNoteSlotText = [string]$noteSlots[0].PSObject.Properties['title'].Value
}
$publicationDescription = if ($profile.Bio) { $profile.Bio } else { "Public analytics view for $($profile.PublicationName)." }
$statusDate = Get-Date
$dashboard = @{}
$dashboard['generatedAt'] = $statusDate.ToString("o")
$dashboard['generatedLabel'] = (Get-EasternTime -UtcDate $statusDate).ToString("MMM d, yyyy h:mm tt 'ET'")
$dashboard['statusLine'] = "Updated " + (Get-EasternTime -UtcDate $statusDate).ToString("MMM d, yyyy h:mm tt 'ET'")
$dashboard['refreshCommand'] = "powershell -ExecutionPolicy Bypass -File .\scripts\update-data.ps1"
$dashboard['publication'] = @{
    name = $profile.PublicationName
    author = $profile.Name
    description = $publicationDescription
    url = $profile.PublicationUrl
    logoUrl = $profile.LogoUrl
    coverUrl = $profile.CoverUrl
    launched = $profile.RankingDetail
}
$dashboard['overview'] = @{
    bestPublishingSlot = $bestPublishingSlotText
    bestNoteSlot = $bestNoteSlotText
}
$dashboard['metrics'] = $metrics
$dashboard['topicBreakdown'] = $topicBreakdown
$dashboard['formats'] = $formatGroups
$dashboard['suggestions'] = $suggestions.ToArray()
$dashboard['postLeaderboard'] = @($rssPosts)
$dashboard['calendar'] = @($calendar.ToArray() | Select-Object -First 4)
$dashboard['watchlist'] = $watchlistCards.ToArray()
$dashboard['noteHistory'] = $noteHistory
$dashboardJson = $dashboard | ConvertTo-Json -Depth 8
[System.IO.File]::WriteAllText($OutputPath, $dashboardJson, (New-Object System.Text.UTF8Encoding($false)))
$dashboardJsPath = [System.IO.Path]::ChangeExtension($OutputPath, '.js')
$dashboardJs = "window.__DASHBOARD_SNAPSHOT__ = " + $dashboardJson + ";"
[System.IO.File]::WriteAllText($dashboardJsPath, $dashboardJs, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "Wrote dashboard snapshot to $OutputPath"
