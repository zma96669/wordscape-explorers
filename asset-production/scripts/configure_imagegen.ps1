[CmdletBinding()]
param(
    [string]$BaseUrl = "https://nai.xuelilaoshi.cn/v1"
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$form = New-Object System.Windows.Forms.Form
$form.Text = "配置图片生成中转站"
$form.StartPosition = "CenterScreen"
$form.ClientSize = New-Object System.Drawing.Size(540, 215)
$form.FormBorderStyle = "FixedDialog"
$form.MaximizeBox = $false
$form.MinimizeBox = $false
$form.TopMost = $true

$helpLabel = New-Object System.Windows.Forms.Label
$helpLabel.Location = New-Object System.Drawing.Point(22, 18)
$helpLabel.Size = New-Object System.Drawing.Size(495, 42)
$helpLabel.Text = "请输入新创建的中转站 API Key。Key 只保存到当前 Windows 用户环境变量，不会写入项目文件。"
$form.Controls.Add($helpLabel)

$baseLabel = New-Object System.Windows.Forms.Label
$baseLabel.Location = New-Object System.Drawing.Point(22, 69)
$baseLabel.Size = New-Object System.Drawing.Size(90, 24)
$baseLabel.Text = "中转站地址"
$form.Controls.Add($baseLabel)

$baseBox = New-Object System.Windows.Forms.TextBox
$baseBox.Location = New-Object System.Drawing.Point(116, 66)
$baseBox.Size = New-Object System.Drawing.Size(400, 25)
$baseBox.Text = $BaseUrl.TrimEnd('/')
$form.Controls.Add($baseBox)

$keyLabel = New-Object System.Windows.Forms.Label
$keyLabel.Location = New-Object System.Drawing.Point(22, 109)
$keyLabel.Size = New-Object System.Drawing.Size(90, 24)
$keyLabel.Text = "API Key"
$form.Controls.Add($keyLabel)

$keyBox = New-Object System.Windows.Forms.TextBox
$keyBox.Location = New-Object System.Drawing.Point(116, 106)
$keyBox.Size = New-Object System.Drawing.Size(400, 25)
$keyBox.UseSystemPasswordChar = $true
$form.Controls.Add($keyBox)

$saveButton = New-Object System.Windows.Forms.Button
$saveButton.Location = New-Object System.Drawing.Point(332, 158)
$saveButton.Size = New-Object System.Drawing.Size(88, 32)
$saveButton.Text = "保存"
$saveButton.DialogResult = [System.Windows.Forms.DialogResult]::OK
$form.AcceptButton = $saveButton
$form.Controls.Add($saveButton)

$cancelButton = New-Object System.Windows.Forms.Button
$cancelButton.Location = New-Object System.Drawing.Point(428, 158)
$cancelButton.Size = New-Object System.Drawing.Size(88, 32)
$cancelButton.Text = "取消"
$cancelButton.DialogResult = [System.Windows.Forms.DialogResult]::Cancel
$form.CancelButton = $cancelButton
$form.Controls.Add($cancelButton)

$form.Add_Shown({ $keyBox.Focus() })
$result = $form.ShowDialog()

if ($result -ne [System.Windows.Forms.DialogResult]::OK) {
    Write-Host "已取消配置。"
    exit 2
}

$plainKey = $keyBox.Text.Trim()
$configuredBaseUrl = $baseBox.Text.Trim().TrimEnd('/')
if ([string]::IsNullOrWhiteSpace($plainKey)) {
    [System.Windows.Forms.MessageBox]::Show("API Key 不能为空。", "配置失败", "OK", "Error") | Out-Null
    exit 1
}
if ([string]::IsNullOrWhiteSpace($configuredBaseUrl)) {
    [System.Windows.Forms.MessageBox]::Show("中转站地址不能为空。", "配置失败", "OK", "Error") | Out-Null
    exit 1
}

[Environment]::SetEnvironmentVariable("OPENAI_BASE_URL", $configuredBaseUrl, "User")
[Environment]::SetEnvironmentVariable("OPENAI_API_KEY", $plainKey, "User")
$keyBox.Clear()
$plainKey = $null

[System.Windows.Forms.MessageBox]::Show(
    "配置完成。现在可以由 Codex 测试图片接口。",
    "图片模型配置成功",
    "OK",
    "Information"
) | Out-Null

Write-Host "图片模型配置完成。"
