param([string]$FilePath)

if ($FilePath -and $FilePath -match '\.ts$' -and $FilePath -match 'pethelp') {
    Push-Location "d:/workspace/pethelp/pethelp-server"
    npx tsc --noEmit 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Output '{ "continue": false, "systemMessage": "TypeScript errors found" }'
    } else {
        Write-Output '{ "continue": true, "systemMessage": "TypeScript OK" }'
    }
    Pop-Location
} else {
    Write-Output '{ "continue": true }'
}
