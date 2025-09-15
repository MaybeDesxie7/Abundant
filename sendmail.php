<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name    = strip_tags(trim($_POST["name"]));
    $email   = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
    $message = trim($_POST["message"]);

    // Recipient email (replace with your domain email)
    $to = "info@abundantfruits.com"; 

    // Subject
    $subject = "New Message from Abundant Fruits Website";

    // Email Content
    $email_content  = "You have received a new message from your website.\n\n";
    $email_content .= "Name: $name\n";
    $email_content .= "Email: $email\n\n";
    $email_content .= "Message:\n$message\n";

    // Headers (Sender name will show as "Abundant Fruits")
    $headers  = "From: Abundant Fruits <info@abundantfruits.com>\r\n";
    $headers .= "Reply-To: $email\r\n";

    // Send email
    if (mail($to, $subject, $email_content, $headers)) {
        echo "<h3>Thank you! Your message has been sent.</h3>";
    } else {
        echo "<h3>Sorry, something went wrong. Please try again later.</h3>";
    }
}
?>
