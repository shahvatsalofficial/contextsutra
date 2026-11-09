param([string]$ProjectRoot = (Get-Location).Path, [string]$HostName = 'generic')
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
node (Join-Path $scriptDir '../packages/cli/index.mjs') install --root $ProjectRoot --host $HostName
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
