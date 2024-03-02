import nodemailer from "nodemailer";
import "dotenv/config";

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.USERNAME,
    pass: process.env.APP_PASSWORD,
  },
});

export const sendVerificationCodeEmail = async (
  email: string,
  code: string,
  name: string
) => {
  try {
    const options = {
      from: "nnamdidanielosuji@gmail.com", // sender address
      to: email, // receiver email
      subject: "Email Verification", // Subject line
      text: "Welcome to NIGALEX E-BIDING APP",
      html: `
      <html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NIGALEX E-BIDING APP Admin Panel</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 5px;
      background-color: #f9f9f9;
    }
    h1 {
      color: #3E4095;
    }
    p {
      margin-bottom: 15px;
    }
    .footer {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #ddd;
      text-align: center;
    }
  </style>
</head>
<body>
<div class="container">
    <h3>Welcome to NIGALEX E-BIDING APP !</h3>
    <p>Hello ${name},</p>
    <p>Your account on <strong>NIGALEX E-BIDING APP</strong> has been created successfully. To proceed, please verify your email address:</p>
    <p>Verification Token: <strong>${code}</strong></p>
    <p>If you did not request this account creation, please ignore this email or contact our support team immediately.</p>
    <p>Thank you!</p>
</div>
<div class="footer">
    <p>NIGALEX E-BIDING APP &copy; 2024. All rights reserved.</p>
</div>
</body>
</html>
      `,
    };

    const info = await transporter.sendMail(options);
    // callback(info);
  } catch (error) {
    console.error(error);
  }
};

export const sendAdminWelcomeEmail = async (email: string, name: string) => {
  try {
    const options = {
      from: "nnamdidanielosuji@gmail.com", // sender address
      to: email, // receiver email
      subject: "Email Verification", // Subject line
      text: "Welcome to NIGALEX E-BIDING APP",
      html: `
      <html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NIGALEX E-BIDING APP Admin Panel</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 5px;
      background-color: #f9f9f9;
    }
    h1 {
      color: #3E4095;
    }
    p {
      margin-bottom: 15px;
    }
    .footer {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #ddd;
      text-align: center;
    }
  </style>
</head>
<body>
<div class="container">
<h1>Welcome to NIGALEX E-BIDING APP!</h1>
<p>Hello ${name},</p>
<p>Your account on <strong>NIGALEX E-BIDING APP</strong> has been successfully activated.</p>
<p>You can now log in to our platform and start placing your bids on our amazing products.</p>
<p>If you have any questions or need assistance, please feel free to contact our support team.</p>
</div>
<div class="footer">
<p>NIGALEX E-BIDING APP &copy; 2024. All rights reserved.</p>
</div>
</body>

</html>
      `,
    };

    const info = await transporter.sendMail(options);
    // callback(info);
  } catch (error) {
    console.error(error);
  }
};

export const sendForgotPasswordEmail = async (
  email: string,
  token: string,
  name: string
) => {
  try {
    const options = {
      from: "nnamdidanielosuji@gmail.com", // sender address
      to: email, // receiver email
      subject: "Reset Your Password", // Subject line
      html: `
        <p>Hello, ${name}</p>
        <p>We received a request to reset your password for your account on <strong>NIGALEX E-BIDING App</strong>.</p>
        <p>Please use this token to reset your password:</p>
        <p><strong>${token}</strong></p>
        <p>If you did not make this request, you can ignore this email.</p>
        <p>Thank you!</p>
      `,
    };
    const info = await transporter.sendMail(options);
    // callback(info);
  } catch (error) {
    console.error(error);
  }
};

export const sendPasswordResetSuccessEmail = async (
  email: string,
  name: string
) => {
  try {
    const options = {
      from: "nnamdidanielosuji@gmail.com", // sender address
      to: email, // receiver email
      subject: "Password Reset Successful", // Subject line
      html: `
        <p>Hello ${name},</p>
        <p>Your password has been successfully reset for your account on <strong>NIGALEX E-BIDING App</strong>.</p>
        <p>If you have any further questions or concerns, please feel free to contact our support team.</p>
        <p>Thank you for using our services!</p>
      `,
    };
    const info = await transporter.sendMail(options);
    // callback(info);
  } catch (error) {
    console.error(error);
  }
};

export const sendAccountApprovedEmail = async (email: string, name: string) => {
  try {
    const options = {
      from: "nnamdidanielosuji@gmail.com", // sender address
      to: email, // receiver email
      subject: "Account Approved", // Subject line
      html: `
      <div style="font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px; border-radius: 5px; max-width: 600px; margin: 0 auto;">
      <p style="font-size: 16px;">Hello ${name},</p>
      <p style="font-size: 16px;">Your account on <strong style="color: #007bff;">NIGALEX E-BIDDING App</strong> has been successfully approved!</p>
      <p style="font-size: 16px;">You can now start placing bids on our platform and participate in auctions.</p>
      <p style="font-size: 16px;">If you have any questions or need assistance, please feel free to contact our support team.</p>
      <p style="font-size: 16px;">Thank you for choosing <strong style="color: #007bff;">NIGALEX E-BIDDING App</strong>!</p>
      </div>

      `,
    };
    const info = await transporter.sendMail(options);
    // callback(info);
  } catch (error) {
    console.error(error);
  }
};

export const sendAccountRejectionEmail = async (
  email: string,
  name: string
) => {
  try {
    const options = {
      from: "nnamdidanielosuji@gmail.com", // sender address
      to: email, // receiver email
      subject: "Account Approved", // Subject line
      html: `
      <html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NIGALEX E-BIDING APP Admin Panel</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 5px;
      background-color: #f9f9f9;
    }
    h1 {
      color: #3E4095;
    }
    p {
      margin-bottom: 15px;
    }
    .footer {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #ddd;
      text-align: center;
    }
  </style>
</head>
<body>
<div class="container">
<h1>Account Rejected</h1>
<p>Hello ${name},</p>
<p>We regret to inform you that your account on <strong>NIGALEX E-BIDING APP</strong> has been rejected due to not meeting our criteria.</p>
<p>If you have any questions or need further clarification, please feel free to contact our support team.</p>
</div>
<div class="footer">
<p>NIGALEX E-BIDING APP &copy; 2024. All rights reserved.</p>
</div>
</body>
</html>
      `,
    };
    const info = await transporter.sendMail(options);
    // callback(info);
  } catch (error) {
    console.error(error);
  }
};
