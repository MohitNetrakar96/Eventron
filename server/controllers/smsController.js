const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

function sendSMS(Email, otp) {
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.NODE_MAILER_USER,
            pass: process.env.NODE_MAILER_PASS,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });

    let mailOptions = {
        from: process.env.NODE_MAILER_USER,
        to: Email,
        subject: "Your Verification Code - EventX",
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
                
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Poppins', 'Segoe UI', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333333;
                    background-color: #f5f5f5;
                    margin: 0;
                    padding: 0;
                }
                
                .email-wrapper {
                    max-width: 600px;
                    margin: 30px auto;
                    background-color: #ffffff;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
                }
                
                .email-header {
                    background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
                    padding: 30px 20px;
                    text-align: center;
                }
                
                .email-header .logo {
                    color: white;
                    font-weight: 700;
                    font-size: 32px;
                    letter-spacing: 1px;
                    margin-bottom: 5px;
                }
                
                .email-header h1 {
                    color: white;
                    font-size: 24px;
                    font-weight: 500;
                    margin: 0;
                }
                
                .email-body {
                    padding: 30px;
                }
                
                .greeting {
                    font-size: 18px;
                    margin-bottom: 15px;
                }
                
                .message {
                    margin-bottom: 25px;
                    color: #555;
                }
                
                .otp-container {
                    background: linear-gradient(to right, #f8f9fa, #e9ecef);
                    border-radius: 12px;
                    padding: 25px;
                    text-align: center;
                    margin: 25px 0;
                    border-left: 5px solid #6a11cb;
                }
                
                .otp-code {
                    font-size: 36px;
                    font-weight: 700;
                    color: #6a11cb;
                    letter-spacing: 8px;
                    padding: 10px 0;
                }
                
                .otp-expiry {
                    font-size: 14px;
                    color: #666;
                    margin-top: 10px;
                }
                
                .security-notice {
                    background-color: #fff8f8;
                    border-left: 4px solid #ff3860;
                    padding: 15px;
                    margin: 25px 0;
                    border-radius: 4px;
                }
                
                .security-notice p {
                    color: #ff3860;
                    font-weight: 600;
                    margin: 0;
                }
                
                .help-box {
                    background-color: #f8f9fa;
                    border-radius: 8px;
                    padding: 20px;
                    margin-top: 25px;
                }
                
                .help-box h3 {
                    font-size: 16px;
                    color: #333;
                    margin-bottom: 10px;
                }
                
                .help-box p {
                    font-size: 14px;
                    color: #666;
                    margin: 5px 0;
                }
                
                .email-footer {
                    background-color: #f8f9fa;
                    text-align: center;
                    padding: 20px;
                    border-top: 1px solid #eeeeee;
                    font-size: 12px;
                    color: #777777;
                }
                
                .social-links {
                    margin: 15px 0;
                }
                
                .social-links a {
                    display: inline-block;
                    margin: 0 5px;
                    color: #6a11cb;
                    text-decoration: none;
                }
                
                @media only screen and (max-width: 600px) {
                    .email-wrapper {
                        margin: 10px;
                        width: calc(100% - 20px);
                    }
                    
                    .email-body {
                        padding: 20px;
                    }
                    
                    .otp-code {
                        font-size: 30px;
                        letter-spacing: 5px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="email-wrapper">
                <div class="email-header">
                    <div class="logo">EventX</div>
                    <h1>Verification Code</h1>
                </div>
                
                <div class="email-body">
                    <p class="greeting">Hello,</p>
                    <p class="message">Thank you for using EventX. Please use the following verification code to complete your request:</p>
                    
                    <div class="otp-container">
                        <div class="otp-code">${otp}</div>
                        <p class="otp-expiry">This code will expire in 5 minutes</p>
                    </div>
                    
                    <div class="security-notice">
                        <p>For your security, please do not share this code with anyone.</p>
                    </div>
                    
                    <p class="message">If you did not request this code, please disregard this email or contact our support team if you believe this is an error.</p>
                    
                    <div class="help-box">
                        <h3>Need assistance?</h3>
                        <p>Email: <a href="mailto:support@eventx.com">support@eventx.com</a></p>
                        <p>Website: <a href="https://eventx.com">eventx.com</a></p>
                    </div>
                </div>
                
                <div class="email-footer">
                    <div class="social-links">
                        <a href="#">Facebook</a> • 
                        <a href="#">Twitter</a> • 
                        <a href="#">Instagram</a>
                    </div>
                    <p>&copy; ${new Date().getFullYear()} EventX. All rights reserved.</p>
                    <p>This is an automated message, please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
        `,
    };

    transporter.sendMail(mailOptions, function (err, success) {
        if (err) {
            console.log(err);
        } else {
            console.log("Email sent successfully");
        }
    });
}

function sendTicket(Details) {
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.NODE_MAILER_USER,
            pass: process.env.NODE_MAILER_PASS,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });

    let mailOptions = {
        from: process.env.NODE_MAILER_USER,
        to: Details.email,
        subject: `Your Digital Ticket for ${Details.event_name} - EventX`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: 'Segoe UI', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333333;
                    background-color: #f9f9f9;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
                }
                .header {
                    text-align: center;
                    padding: 20px 0;
                    border-bottom: 1px solid #eeeeee;
                }
                .logo {
                    color: #4a6cf7;
                    font-weight: bold;
                    font-size: 28px;
                    margin-bottom: 10px;
                }
                .event-name {
                    font-size: 24px;
                    color: #333333;
                    margin: 10px 0;
                }
                .content {
                    padding: 20px 0;
                }
                .ticket {
                    background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
                    border-radius: 10px;
                    padding: 25px;
                    color: white;
                    text-align: center;
                    margin: 20px 0;
                    position: relative;
                    overflow: hidden;
                }
                .ticket:before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: url('https://i.imgur.com/8YsYzYY.png');
                    opacity: 0.1;
                    z-index: 0;
                }
                .ticket-content {
                    position: relative;
                    z-index: 1;
                }
                .ticket-id {
                    font-size: 24px;
                    font-weight: bold;
                    letter-spacing: 2px;
                    margin: 15px 0;
                    text-shadow: 1px 1px 3px rgba(0,0,0,0.3);
                }
                .ticket-details {
                    background-color: #f7f9fc;
                    border-radius: 8px;
                    padding: 15px;
                    margin-top: 20px;
                }
                .ticket-details h3 {
                    margin-top: 0;
                    color: #4a6cf7;
                    border-bottom: 1px solid #eeeeee;
                    padding-bottom: 10px;
                }
                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }
                .detail-label {
                    font-weight: bold;
                    color: #555555;
                }
                .footer {
                    text-align: center;
                    padding-top: 20px;
                    border-top: 1px solid #eeeeee;
                    font-size: 12px;
                    color: #777777;
                }
                .contact {
                    background-color: #f7f9fc;
                    border-radius: 8px;
                    padding: 15px;
                    margin-top: 20px;
                    font-size: 13px;
                }
                .note {
                    font-style: italic;
                    color: #888888;
                    font-size: 13px;
                    margin-top: 15px;
                }
                .qr-placeholder {
                    background-color: white;
                    width: 150px;
                    height: 150px;
                    margin: 0 auto;
                    border-radius: 5px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    color: #333;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">EventX</div>
                    <div class="event-name">${Details.event_name}</div>
                </div>
                
                <div class="content">
                    <p>Dear <strong>${Details.name || 'Attendee'}</strong>,</p>
                    <p>Thank you for registering for <strong>${Details.event_name}</strong>! We're excited to have you join us.</p>
                    
                    <div class="ticket">
                        <div class="ticket-content">
                            <h2>DIGITAL TICKET</h2>
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(Details.pass)}" alt="QR Code" width="150" height="150" style="border-radius:5px; background:white; padding:5px;" />
                            <div class="ticket-id">${Details.pass.substring(0, 8)}</div>
                            <p>Present this ticket at the venue entrance</p>
                        </div>
                    </div>
                    
                    <div class="ticket-details">
                        <h3>Registration Details</h3>
                        <div class="detail-row">
                            <span class="detail-label">Name:</span>
                            <span>${Details.name || 'Attendee'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Amount Paid:</span>
                            <span>₹${Details.price}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Address:</span>
                            <span>${Details.address1}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">City:</span>
                            <span>${Details.city}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Pincode:</span>
                            <span>${Details.zip}</span>
                        </div>
                    </div>
                    
                    <p class="note">Please keep this ticket with you during the event. This ticket is unique to you and should not be shared.</p>
                    
                    <div class="contact">
                        <p><strong>Have questions?</strong> Our team is here to help:</p>
                        <p>Email: support@eventx.com</p>
                        <p>Phone: +91 XXXXXXXXXX</p>
                    </div>
                </div>
                
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} EventX. All rights reserved.</p>
                    <p>This is an automated message, please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
        `,
    };

    transporter.sendMail(mailOptions, function (err, success) {
        if (err) {
            console.log(err);
        } else {
            console.log("Email sent successfully");
        }
    });
}

module.exports = {
    sendSMS,
    sendTicket,
};


