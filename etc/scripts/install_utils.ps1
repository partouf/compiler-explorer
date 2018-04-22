
Add-Type -assembly "system.io.compression.filesystem"

$defaultdrive = "c"

$opt = "${defaultdrive}:\opt"
$tmp = "${defaultdrive}:\tmp"

function prepare {
    if (![System.IO.Directory]::Exists($tmp)) {
        [System.IO.Directory]::CreateDirectory($tmp)
    }
    if (![System.IO.Directory]::Exists($opt)) {
        [System.IO.Directory]::CreateDirectory($opt)
    }
}

function fetchCustom {
    Param ([string] $url, [string] $dest)

    [System.Console]::WriteLine("Downloading $url")
    Invoke-WebRequest -Uri $url -OutFile $dest
}

function fetchCustomAndUnzip {
    Param ([string] $url, [string] $tmpfile, [string] $dest)

    $file = "$tmp\$tmpfile"
    fetchCustom -url $url -dest $file

    [System.Console]::WriteLine("Extracting $file to $dest")
    [io.compression.zipfile]::ExtractToDirectory($file, $dest)
}

function get_mingw {
    $url = "https://osdn.net/frs/redir.php?m=acc&f=mingw%2F68260%2Fmingw-get-0.6.3-mingw32-pre-20170905-1-bin.zip"

    $installDir = "$opt\mingw"

    [System.IO.Directory]::CreateDirectory($installDir)
    fetchCustomAndUnzip -url $url -tmpfile "mingw-get-0.6.3-mingw32-pre-20170905-1-bin.zip" -dest $installDir
}

function install_mingw_binutils {
    get_mingw

    $mingwget = "$opt\mingw\bin\mingw-get.exe"

    cmd /c "$mingwget install binutils"
}

function main {
    prepare

    install_mingw_binutils
}

main
