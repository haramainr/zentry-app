$sourceDir = "f:\Zentry\ZEntry_Trial-main"
$tempDir = "f:\Zentry\ZEntryX_Temp"
$destination = "f:\Zentry\ZEntry_Trial-main\ZEntryX_Source.zip"
$destinationRoot = "f:\Zentry\ZEntryX_Source.zip"

if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
if (Test-Path $destination) { Remove-Item $destination -Force }
if (Test-Path $destinationRoot) { Remove-Item $destinationRoot -Force }

New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

# Use robocopy to mirror the directory while excluding node_modules, .next, etc.
# Robocopy exit codes < 8 are considered success.
& robocopy $sourceDir $tempDir /E /XD node_modules .next .git .vscode /XF ZEntryX_Source.zip *.ps1 tsconfig.tsbuildinfo

# Now compress the temp folder contents
Compress-Archive -Path "$tempDir\*" -DestinationPath $destination -Force

# Clean up temp folder
Remove-Item $tempDir -Recurse -Force
Copy-Item $destination $destinationRoot -Force

Write-Host "Archive created successfully at $destination"
