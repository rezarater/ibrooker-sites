<?php
// iBrooker contact form handler (shared by ibrooker.com and ir.ibrooker.com)
$lang = (($_POST['lang'] ?? 'en') === 'fa') ? 'fa' : 'en';
$back = $lang === 'fa' ? 'https://ir.ibrooker.com/' : 'https://ibrooker.com/';

function clean($v, $max = 2000) {
    $v = trim((string)$v);
    $v = str_replace(["\r", "\0"], '', $v);
    return mb_substr($v, 0, $max);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !empty($_POST['website'])) {
    header('Location: ' . $back);
    exit;
}

$name    = clean($_POST['name'] ?? '', 120);
$company = clean($_POST['company'] ?? '', 160);
$email   = clean($_POST['email'] ?? '', 160);
$country = clean($_POST['country'] ?? '', 80);
$goal    = clean($_POST['goal'] ?? '', 120);
$message = clean($_POST['message'] ?? '', 5000);

if ($name === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    header('Location: ' . $back . '?sent=0#contact');
    exit;
}

$to = $lang === 'fa' ? 'export@ibrooker.com' : 'info@ibrooker.com';
$subject = '=?UTF-8?B?' . base64_encode('[iBrooker ' . strtoupper($lang) . '] ' . $goal . ' — ' . $company) . '?=';
$body = "Name: $name\nCompany: $company\nEmail: $email\nCountry: $country\nNeed: $goal\nSite: $lang\n\n$message\n";
$headers  = "From: iBrooker Website <info@ibrooker.com>\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\n";

$ok = mail($to, $subject, $body, $headers, '-finfo@ibrooker.com');

// keep a local log as backup in case mail delivery fails
$log = __DIR__ . '/../ibrooker_leads.log';
@file_put_contents($log, date('c') . "\t" . json_encode(compact('lang','name','company','email','country','goal','message'), JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX);

header('Location: ' . $back . '?sent=' . ($ok ? '1' : '0') . '#contact');
exit;
