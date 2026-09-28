$ErrorActionPreference = 'Stop'

# Cleans generated static pages when a previous conversion left PHP blocks behind.
$htmlFiles = @(Get-ChildItem -LiteralPath . -File -Filter '*.html')
if ($htmlFiles.Count -eq 0) { throw 'No HTML files found.' }

$staticScript = @'
<script>
document.querySelectorAll('form').forEach((form) => form.addEventListener('submit', (event) => {
  event.preventDefault();
  const button = form.querySelector('button[type="submit"], input[type="submit"]');
  if (button) { button.disabled = true; button.dataset.originalText = button.textContent || button.value; if ('value' in button) button.value = 'Demo mode'; else button.textContent = 'Demo mode'; }
  window.alert('This is a static GitHub Pages demo. Saving data requires a backend.');
}));
</script>
'@

foreach ($file in $htmlFiles) {
  $source = [System.IO.File]::ReadAllText($file.FullName)
  # Remove complete PHP blocks, then discard a server-only unclosed block.
  $html = [regex]::Replace($source, '(?s)<\?(?:php|=).*?\?>', '')
  $html = [regex]::Replace($html, '(?s)<\?php.*$', '')
  $html = $html -replace '(?i)\.php(?=(["''?#/]|\s|$))', '.html'
  $html = $html -replace '/RestaurantPOS/', './'
  [System.IO.File]::WriteAllText($file.FullName, $html, [System.Text.UTF8Encoding]::new($false))
}

# Update static assets that still point at old PHP page names.
Get-ChildItem -LiteralPath . -File -Include '*.html','*.js','*.css' | ForEach-Object {
  $text = [System.IO.File]::ReadAllText($_.FullName)
  $updated = $text -replace '(?i)\.php(?=(["''?#/]|\s|$))', '.html'
  $updated = $updated -replace '/RestaurantPOS/', './'
  if ($updated -cne $text) { [System.IO.File]::WriteAllText($_.FullName, $updated, [System.Text.UTF8Encoding]::new($false)) }
}

Write-Output "Removed PHP code from $($htmlFiles.Count) static HTML files and updated legacy links."
