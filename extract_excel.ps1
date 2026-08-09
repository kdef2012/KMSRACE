$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
try {
    Write-Output "Opening Excel file..."
    $workbook = $excel.Workbooks.Open("C:\Users\kdnelson\Downloads\All Students1.xlsx")
    $sheet = $workbook.Sheets.Item(1)
    
    Write-Output "Reading UsedRange..."
    $usedRange = $sheet.UsedRange
    $rows = $usedRange.Rows.Count
    $cols = $usedRange.Columns.Count
    
    $csvPath = "C:\Users\kdnelson\.gemini\antigravity\scratch\kms-competition\students_exported.csv"
    
    Write-Output "Extracting $rows rows and $cols columns..."
    
    $csvData = @()
    for ($r = 1; $r -le $rows; $r++) {
        $rowData = @()
        for ($c = 1; $c -le $cols; $c++) {
            $cellValue = $usedRange.Cells.Item($r, $c).Text
            # Escape quotes and wrap in quotes for CSV
            if ($cellValue -eq $null) { $cellValue = "" }
            $cellValue = $cellValue -replace '"', '""'
            $rowData += "`"$cellValue`""
        }
        $csvData += ($rowData -join ",")
    }
    
    $csvData | Out-File -FilePath $csvPath -Encoding UTF8
    $workbook.Close($false)
    Write-Output "Success: Extracted data to $csvPath"
} catch {
    Write-Output "Error: $_"
} finally {
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
}
