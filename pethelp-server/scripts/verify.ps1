# PetHelp Verification Hook Script
# For Stop hook: checks code quality, blocks session end if issues found
# Outputs hook-compatible JSON
param(
    [switch]$HookMode = $false
)

$ErrorActionPreference = "Continue"
$allPassed = $true
$messages = @()

# 1. TypeScript Type Check
Push-Location "d:/workspace/pethelp/pethelp-server"
$tscResult = npx tsc --noEmit 2>&1
if ($LASTEXITCODE -eq 0) {
    $messages += "PASS: TypeScript types OK"
} else {
    $messages += "FAIL: TypeScript errors found"
    $messages += ($tscResult | Select-Object -First 5)
    $allPassed = $false
}
Pop-Location

# 2. NestJS Build
Push-Location "d:/workspace/pethelp/pethelp-server"
$buildResult = npx nest build 2>&1
if ($LASTEXITCODE -eq 0) {
    $messages += "PASS: NestJS build OK"
} else {
    $messages += "FAIL: NestJS build errors"
    $allPassed = $false
}
Pop-Location

# 3. Check for console.log
Push-Location "d:/workspace/pethelp"
$diffs = git diff --name-only HEAD 2>$null
if ($diffs) {
    $consoleLogHits = Select-String -Path $diffs -Pattern "console\.log" 2>$null
    if ($consoleLogHits) {
        $messages += "FAIL: console.log found in modified files"
        $allPassed = $false
    } else {
        $messages += "PASS: No console.log"
    }
}
Pop-Location

# Output JSON for hook consumption
$messageStr = ($messages -join "`n")
if ($allPassed) {
    Write-Output '{ "continue": true, "systemMessage": "All checks passed" }'
    exit 0
} else {
    $jsonMsg = $messageStr -replace '"', '\"'
    Write-Output "{ `"continue`": false, `"stopReason`": `"$jsonMsg`", `"systemMessage`": `"Verification failed - fix issues before ending session`" }"
    exit 0  # exit 0 so hook output is captured; blocking is via JSON continue:false
}
