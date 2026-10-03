<?php
// Run by cron on the host every 10 minutes.
// Downloads the latest code from GitHub as a zip and copies com/ and ir/ into place.
// Uses only PHP (no shell), because the host allows PHP cron jobs only.
$home  = '/home/ibrook';
$zipUrl = 'https://codeload.github.com/rezarater/ibrooker-sites/zip/refs/heads/main';
$state = $home . '/.ibrooker_deploy_hash';
$tmp   = $home . '/tmp/ibrooker_deploy';

$ctx = stream_context_create(['http' => ['timeout' => 60, 'header' => "User-Agent: ibrooker-deploy\r\n"]]);
$data = @file_get_contents($zipUrl, false, $ctx);
if ($data === false || strlen($data) < 1000) { exit(0); }

$hash = md5($data);
if (is_file($state) && trim(file_get_contents($state)) === $hash) { exit(0); }

function rrmdir($d) { if (!is_dir($d)) return; foreach (array_diff(scandir($d), ['.', '..']) as $f) { $p = "$d/$f"; is_dir($p) ? rrmdir($p) : unlink($p); } rmdir($d); }
function rcopy($src, $dst) {
    if (!is_dir($dst)) mkdir($dst, 0755, true);
    foreach (array_diff(scandir($src), ['.', '..']) as $f) {
        $s = "$src/$f"; $t = "$dst/$f";
        is_dir($s) ? rcopy($s, $t) : copy($s, $t);
    }
}

rrmdir($tmp);
mkdir($tmp, 0755, true);
file_put_contents("$tmp/src.zip", $data);
$zip = new ZipArchive();
if ($zip->open("$tmp/src.zip") !== true) { exit(1); }
$zip->extractTo($tmp);
$zip->close();

$root = glob("$tmp/ibrooker-sites-*", GLOB_ONLYDIR)[0] ?? null;
if (!$root || !is_dir("$root/com") || !is_dir("$root/ir")) { exit(1); }

rcopy("$root/com", "$home/public_html");
rcopy("$root/ir", "$home/ir.ibrooker.com");
file_put_contents($state, $hash);
rrmdir($tmp);
