import nodemailer from 'nodemailer';

export const sendMail = (
  mailAddresses: string,
  subjectText: string,
  htmlText: string,
  attachments?: any[]
): Promise<boolean> => {
  return new Promise((resolve) => {
    // Transporter instance utilizing corporate Office365 SMTP coordinates
    const transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false,
      auth: {
        user: "info@adamma.in",
        pass: "Adamma@2025"
      }
    });

    const mailOptions = {
      from: "info@adamma.in",
      to: mailAddresses,
      subject: subjectText,
      html: htmlText,
      attachments: attachments ? attachments : []
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Nodemailer SMTP Transport Error:', error);
        resolve(false);
      } else {
        console.log('Welcome Email successfully sent:', info.response);
        resolve(true);
      }
    });
  });
};
