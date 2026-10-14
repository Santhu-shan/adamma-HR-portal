import { ConfidentialClientApplication } from '@azure/msal-node';
import axios from 'axios';
import nodemailer from 'nodemailer';

const msalConfig = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID || '7c3fa100-b06a-439e-9a8f-5286c727e91c',
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID || '8f9372d6-92ff-4057-809f-2f0a599a2e21'}`,
    clientSecret: process.env.AZURE_CLIENT_SECRET ,
  },
};

const cca = new ConfidentialClientApplication(msalConfig);
const SCOPES = ["https://graph.microsoft.com/.default"];
const senderEmail = process.env.AZURE_SENDER_EMAIL || "info@adamma.in";

// Get access token via Client Credentials Grant
export const getAccessTokenGraph = async (): Promise<string> => {
  const result = await cca.acquireTokenByClientCredential({
    scopes: SCOPES,
  });
  if (!result || !result.accessToken) {
    throw new Error("Could not acquire MS Graph access token");
  }
  return result.accessToken;
};

// Send email via Graph API with Nodemailer SMTP Fallback
export const sendGraphEmail = async (
  toList: string | string[],
  ccList: string | string[],
  subject: string,
  htmlBody: string,
  accessToken?: string
): Promise<boolean> => {
  const finalToList = Array.isArray(toList) ? toList : [toList];
  const finalCCList = Array.isArray(ccList) ? ccList : ccList ? [ccList] : [];

  let token = accessToken;
  if (!token) {
    try {
      token = await getAccessTokenGraph();
    } catch (e: any) {
      console.warn("Failed to get MS Graph token, attempting direct SMTP fallback:", e.message);
    }
  }

  if (token) {
    const emailPayload = {
      message: {
        subject: subject,
        body: {
          contentType: "HTML",
          content: htmlBody,
        },
        toRecipients: finalToList.map(email => ({ emailAddress: { address: email.trim() } })),
        ccRecipients: finalCCList.map(email => ({ emailAddress: { address: email.trim() } })),
      },
      saveToSentItems: "true",
    };

    try {
      await axios.post(
        `https://graph.microsoft.com/v1.0/users/${senderEmail}/sendMail`,
        emailPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(`Email successfully dispatched via Microsoft Graph API. To: [${finalToList}], CC: [${finalCCList}]`);
      return true;
    } catch (error: any) {
      console.error("Microsoft Graph API Send failure. Error Details:", error.response?.data || error.message);
      console.log("Redirecting execution flow to Nodemailer SMTP fallback transporter...");
    }
  }

  // Nodemailer SMTP Fallback
  return new Promise((resolve) => {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.office365.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER || "info@adamma.in",
      to: finalToList.join(', '),
      cc: finalCCList.join(', '),
      subject: subject,
      html: htmlBody,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("SMTP Fallback transport failure:", error.message);
        resolve(false);
      } else {
        console.log("Email successfully dispatched via SMTP Fallback. To:", finalToList);
        resolve(true);
      }
    });
  });
};

// Fetch emails from Graph API
export const getGraphEmails = async (accessToken: string, searchString: string): Promise<any[]> => {
  try {
    const url = `https://graph.microsoft.com/v1.0/users/${senderEmail}/mailFolders/Inbox/messages?$filter=contains(subject, '${searchString}')&$select=subject,receivedDateTime,from,bodyPreview,body&$top=50`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    return response.data.value;
  } catch (error: any) {
    console.error("Error fetching emails from Graph:", error.response?.data || error.message);
    throw new Error("Failed to fetch emails from Microsoft Graph");
  }
};

// Fetch recent emails from Graph API
export const getRecentGraphEmails = async (accessToken: string): Promise<any[]> => {
  try {
    const url = `https://graph.microsoft.com/v1.0/users/${senderEmail}/mailFolders/inbox/messages?$select=subject,receivedDateTime&$top=200`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    return response.data.value;
  } catch (error: any) {
    console.error("Error fetching recent emails from Graph:", error.response?.data || error.message);
    return [];
  }
};