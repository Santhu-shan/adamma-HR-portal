import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UserModel } from '../models/User';
import { requirePermission } from '../middlewares/rbac';
import { sendGraphEmail } from '../utils/graphMailHelper';

const router = Router();
const jwtSecret = process.env.JWT_SECRET || 'super_secret_session_crypto_key';

// Dynamic User Onboarding & Credentials Creation Route
router.post('/onboard', requirePermission('USER_CREATE'), async (req: any, res: Response) => {
  const { 
    employeeId,
    name, 
    email, 
    mobile, 
    role, 
    status, 
    doj, 
    dob,
    designation,
    department,
    location,
    probationDuration,
    targetTl,
    targetManager,
    bankDetails,
    salary,
    deductions
  } = req.body;

  try {
    // Validate Employee ID manual entry
    if (!employeeId || typeof employeeId !== 'string' || !employeeId.startsWith('AIS')) {
      return res.status(400).json({
        code: 'INVALID_EMPLOYEE_ID',
        message: 'Employee ID is required and must start with "AIS" prefix.'
      });
    }

    const existingEmpId = await UserModel.findOne({ employeeId });
    if (existingEmpId) {
      return res.status(400).json({
        code: 'EMPLOYEE_ID_EXISTS',
        message: `Employee ID "${employeeId}" is already assigned to another user.`
      });
    }

    // 1. Verify if email already registered
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        code: 'USER_EXISTS', 
        message: 'This corporate email address is already registered in the database.' 
      });
    }

    // 2. Generate secure temporary password
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let generatedPassword = 'AIS-P@';
    for (let i = 0; i < 6; i++) {
      generatedPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // 3. Hash password via bcrypt
    const passwordHash = await bcrypt.hash(generatedPassword, 10);

    // 4. Calculate probation end date
    const dojDate = new Date(doj || new Date());
    let probEnd = new Date(dojDate);
    if (status === 'PROBATION') {
      const months = parseInt(probationDuration) || 6;
      probEnd.setMonth(dojDate.getMonth() + months);
    }

    // 5. Query TL and Manager IDs if defined
    let tlId = undefined;
    let managerId = undefined;
    if (targetTl) {
      const tlUser = await UserModel.findOne({ name: targetTl });
      if (tlUser) tlId = tlUser._id as any;
    }
    if (targetManager) {
      const mgrUser = await UserModel.findOne({ name: targetManager });
      if (mgrUser) managerId = mgrUser._id as any;
    }

    // 6. Create User Record in database
    const newUser = new UserModel({
      employeeId,
      name,
      email,
      password: passwordHash,
      mobile: mobile || "+91 98765 43000",
      role: role || 'EMPLOYEE',
      status: status || 'PROBATION',
      dateOfJoining: dojDate,
      dob: dob || "1995-01-01",
      designation,
      department,
      location: location || "Bengaluru",
      probationEnd: probEnd,
      tlId,
      managerId,
      bankDetails: {
        bankName: bankDetails?.bankName || "Axis Bank Ltd",
        accountNumber: bankDetails?.accountNumber || "912010000000000",
        ifscCode: bankDetails?.ifscCode || "UTIB0000004",
        uan: bankDetails?.uan,
        pfMemberId: bankDetails?.pfMemberId,
        pan: bankDetails?.pan
      },
      salary: {
        baseSalary: salary?.baseSalary || 45000,
        hra: salary?.hra || 0,
        conveyance: salary?.conveyance || 0,
        medical: salary?.medical || 0,
        otherAllowance: salary?.otherAllowance || 0,
        lta: salary?.lta || 0,
        annualMedical: salary?.annualMedical || 0,
        bonus: salary?.bonus || 0
      },
      deductions: {
        epf: deductions?.epf || 0,
        tds: deductions?.tds || 0,
        profTax: deductions?.profTax || 0,
        retentionAmount: deductions?.retentionAmount || 0
      },
      clBalance: status === 'PROBATION' ? 6 : 12,
      elBalance: 0,
      slBalance: 6,
      compOffBalance: 0
    });

    await newUser.save();

    // 7. Compose HTML Welcome Email containing Credentials Kit
    const welcomeHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1a202c;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #ff6b00;">
          <h2 style="color: #ff6b00; margin: 0; font-size: 24px; letter-spacing: 1px;">ADAMMA INFO SERVICES PRIVATE LIMITED</h2>
          <p style="margin: 5px 0 0 0; font-size: 11px; text-transform: uppercase; color: #718096; font-weight: bold; font-family: monospace;">Workforce Onboarding Portal</p>
        </div>
        
        <div style="padding: 30px 10px;">
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">Hello <strong>${name}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #4a5568; margin: 0 0 25px 0;">Welcome to the Adamma Info Services family! Your corporate HR workforce account has been successfully configured. Below are your official system login credentials:</p>
          
          <div style="background-color: #f7fafc; border: 1px solid #edf2f7; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #718096; font-weight: bold; width: 35%;">Username (Email):</td>
                <td style="padding: 6px 0; font-weight: bold; color: #1a202c; font-family: monospace;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #718096; font-weight: bold;">Temp Password:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #d69e2e; font-family: monospace; font-size: 14px; letter-spacing: 0.5px;">${generatedPassword}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #718096; font-weight: bold;">Designation:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #1a202c;">${designation}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #718096; font-weight: bold;">Department:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #1a202c;">${department}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin-bottom: 25px;">
            <a href="http://localhost:3000/login" style="background-color: #ff6b00; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(255, 107, 0, 0.2);">Access HRMS Portal</a>
          </div>

          <p style="font-size: 12px; line-height: 1.6; color: #718096; margin: 0;">
            <em>Security Notice:</em> Upon your first login authorization, the system will prompt you to complete a mandatory 2FA enrollment check. Keep your temporary credentials strictly secure.
          </p>
        </div>

        <div style="border-t: 1px solid #edf2f7; padding-top: 20px; font-size: 10px; color: #a0aec0; text-align: center; font-family: monospace;">
          This is an automated system welcome dispatch. Office365 SMTP active.
        </div>
      </div>
    `;

    // 8. Dispatch Email via MS Graph with SMTP fallback
    const emailSent = await sendGraphEmail(email, [], "Welcome to Adamma Info Services - Your HRMS Credentials", welcomeHtml);

    res.status(201).json({
      success: true,
      userId: newUser._id,
      generatedPassword,
      emailSent,
      message: 'Employee successfully onboarded and credentials welcome kit dispatched!'
    });

  } catch (error: any) {
    console.error('Onboarding operational failure:', error);
    res.status(500).json({ 
      code: 'ONBOARD_FAILED', 
      message: 'Onboarding processing encountered a server exception.',
      details: error.message
    });
  }
});

// Update Candidate details endpoint
router.post('/update/:id', requirePermission('USER_CREATE'), async (req: any, res: Response) => {
  const { id } = req.params;
  const { 
    employeeId,
    name, 
    email, 
    mobile, 
    role, 
    status, 
    doj, 
    dob,
    designation,
    department,
    location,
    probationDuration,
    targetTl,
    targetManager,
    bankDetails,
    salary,
    deductions
  } = req.body;

  try {
    // 1. Verify user exists
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({
        code: 'USER_NOT_FOUND',
        message: 'No active profile found matching this candidate ID.'
      });
    }

    // 2. Map TL and Manager IDs if defined
    let tlId = undefined;
    let managerId = undefined;
    if (targetTl && targetTl !== '--') {
      const tlUser = await UserModel.findOne({ name: targetTl });
      if (tlUser) tlId = tlUser._id as any;
    }
    if (targetManager && targetManager !== '--') {
      const mgrUser = await UserModel.findOne({ name: targetManager });
      if (mgrUser) managerId = mgrUser._id as any;
    }

    // 3. Update User fields
    if (employeeId && employeeId !== user.employeeId) {
      if (!employeeId.startsWith('AIS')) {
        return res.status(400).json({
          code: 'INVALID_EMPLOYEE_ID',
          message: 'Employee ID must start with "AIS" prefix.'
        });
      }
      const existingEmpId = await UserModel.findOne({ employeeId });
      if (existingEmpId) {
        return res.status(400).json({
          code: 'EMPLOYEE_ID_EXISTS',
          message: `Employee ID "${employeeId}" is already assigned to another user.`
        });
      }
      user.employeeId = employeeId;
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.mobile = mobile || user.mobile;
    user.role = role || user.role;
    user.status = status || user.status;
    if (doj) user.dateOfJoining = new Date(doj);
    if (dob) user.dob = dob;
    if (designation) user.designation = designation;
    if (department) user.department = department;
    if (location) user.location = location;
    user.tlId = tlId;
    user.managerId = managerId;

    if (status === 'PROBATION' && doj && probationDuration) {
      const dojDate = new Date(doj);
      const probEnd = new Date(dojDate);
      probEnd.setMonth(dojDate.getMonth() + parseInt(probationDuration));
      user.probationEnd = probEnd;
    }

    // Update bank details
    if (bankDetails) {
      user.bankDetails = {
        bankName: bankDetails.bankName || user.bankDetails.bankName,
        accountNumber: bankDetails.accountNumber || user.bankDetails.accountNumber,
        ifscCode: bankDetails.ifscCode || user.bankDetails.ifscCode,
        uan: bankDetails.uan || user.bankDetails.uan,
        pfMemberId: bankDetails.pfMemberId || user.bankDetails.pfMemberId,
        pan: bankDetails.pan || user.bankDetails.pan
      };
    }

    // Update salary details
    if (salary) {
      user.salary = {
        baseSalary: salary.baseSalary !== undefined ? salary.baseSalary : user.salary.baseSalary,
        hra: salary.hra !== undefined ? salary.hra : user.salary.hra,
        conveyance: salary.conveyance !== undefined ? salary.conveyance : user.salary.conveyance,
        medical: salary.medical !== undefined ? salary.medical : user.salary.medical,
        otherAllowance: salary.otherAllowance !== undefined ? salary.otherAllowance : user.salary.otherAllowance,
        lta: salary.lta !== undefined ? salary.lta : user.salary.lta,
        annualMedical: salary.annualMedical !== undefined ? salary.annualMedical : user.salary.annualMedical,
        bonus: salary.bonus !== undefined ? salary.bonus : user.salary.bonus
      };
    }

    // Update deductions
    if (deductions) {
      user.deductions = {
        epf: deductions.epf !== undefined ? deductions.epf : user.deductions.epf,
        tds: deductions.tds !== undefined ? deductions.tds : user.deductions.tds,
        profTax: deductions.profTax !== undefined ? deductions.profTax : user.deductions.profTax,
        retentionAmount: deductions.retentionAmount !== undefined ? deductions.retentionAmount : user.deductions.retentionAmount
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      user,
      message: 'Candidate profile successfully updated!'
    });
  } catch (error: any) {
    console.error('Candidate update operational failure:', error);
    res.status(500).json({
      code: 'UPDATE_FAILED',
      message: 'Updating candidate profile encountered a server exception.',
      details: error.message
    });
  }
});

// Fetch all employees endpoint
router.get('/users', requirePermission('USER_CREATE'), async (req: any, res: Response) => {
  try {
    const users = await UserModel.find({}).populate('tlId').populate('managerId');
    // Map them to the shape the frontend settings page expects
    const formattedUsers = users.map(user => {
      const dojDate = new Date(user.dateOfJoining);
      const formattedDoj = dojDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      
      const probEnd = user.probationEnd;
      const formattedProbEnd = user.status === 'PROBATION' && probEnd
        ? new Date(probEnd).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : '--';

      // Find supervisor names if populated
      const tlName = (user.tlId as any)?.name || '--';
      const mgrName = (user.managerId as any)?.name || '--';

      return {
        id: user._id,
        employeeId: user.employeeId || 'AIS' + Math.floor(1000 + Math.random() * 9000),
        profilePic: user.profilePic,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        status: user.status,
        doj: formattedDoj,
        dob: user.dob,
        designation: user.designation,
        department: user.department,
        location: user.location,
        probationEnd: formattedProbEnd,
        probationDuration: user.status === 'PROBATION' ? '6 months' : '--',
        tl: tlName,
        manager: mgrName,
        bankDetails: user.bankDetails,
        salary: user.salary,
        deductions: user.deductions
      };
    });

    res.status(200).json(formattedUsers);
  } catch (error: any) {
    console.error('Fetch users failure:', error);
    res.status(500).json({
      code: 'FETCH_USERS_FAILED',
      message: 'Failed to retrieve active employees from database.',
      details: error.message
    });
  }
});

// Dynamic Login Authenticator: Credential validation & OTP generation
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Find active user profile
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        code: 'INVALID_CREDENTIALS', 
        message: 'No active profile found matching this email address.' 
      });
    }

    // Block login for deactivated (suspended) users scheduled for deletion
    if (user.status === 'SUSPENDED' && user.scheduledDeletionDate) {
      const deletionStr = user.scheduledDeletionDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      return res.status(403).json({
        code: 'ACCOUNT_DEACTIVATED',
        message: `Your corporate account has been deactivated and is scheduled for permanent deletion on ${deletionStr}. Please contact your system Administrator.`
      });
    }

    // Dynamic password validation
    if (user.password) {
      // User has a real hashed password stored (newly onboarded)
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ 
          code: 'INVALID_CREDENTIALS', 
          message: 'Invalid credentials. Password coordinates do not match.' 
        });
      }
    } else {
      // Sandbox fallback validation for pre-seeded developer persona profiles
      // Pre-seeded profiles don't have passwords in the database seed yet, so we permit bypass for demo shortcuts
      console.log(`Allowing bypass access for pre-seeded testing profile: ${email}`);
    }

    // Generate secure 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    await user.save();
    console.log(`\n======================================================`);
    console.log(`[OTP BYPASS] Generated OTP for ${email}: ${otp}`);
    console.log(`======================================================\n`);

    // Compose HTML OTP Verification Email
    const otpHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1a202c;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #ff6b00;">
          <h2 style="color: #ff6b00; margin: 0; font-size: 22px; letter-spacing: 0.5px;">ADAMMA WORKFORCE PORTAL</h2>
          <p style="margin: 5px 0 0 0; font-size: 10px; text-transform: uppercase; color: #718096; font-weight: bold; font-family: monospace;">Secure 2-Factor Authentication OTP</p>
        </div>
        
        <div style="padding: 25px 5px; text-align: center;">
          <p style="font-size: 15px; color: #4a5568; margin: 0 0 20px 0;">Use the verification code below to authorize your HRMS console access session:</p>
          
          <div style="background-color: #f7fafc; border: 1px solid #edf2f7; border-radius: 8px; padding: 15px 25px; display: inline-block; letter-spacing: 4px; font-size: 28px; font-weight: 900; color: #ff6b00; font-family: monospace;">
            ${otp}
          </div>
          
          <p style="font-size: 12px; color: #718096; margin: 20px 0 0 0;">
            This OTP is valid for the next <b>10 minutes</b>. Please do not share this code with anyone.
          </p>
        </div>

        <div style="border-top: 1px solid #edf2f7; padding-top: 15px; font-size: 9px; color: #a0aec0; text-align: center; font-family: monospace;">
          Need help? Write to <a href="mailto:info@adamma.in" style="color: #ff6b00; text-decoration: none;">info@adamma.in</a>
        </div>
      </div>
    `;

    try {
      await sendGraphEmail(email, [], 'OTP to sign in to Adamma HRMS', otpHtml);
    } catch (emailErr: any) {
      console.error('FAILED TO DISPATCH OTP EMAIL VIA MICROSOFT GRAPH:', emailErr.message);
    }

    res.status(200).json({
      success: true,
      otpRequired: true,
      message: 'OTP verification code has been dispatched. Please check your email or console.'
    });

  } catch (error) {
    console.error('Login authorization operational failure:', error);
    res.status(500).json({ 
      code: 'AUTH_FAILED', 
      message: 'Authentication processing encountered a server exception.' 
    });
  }
});

// OTP verification & token generation endpoint
router.post('/verify-otp', async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({
        code: 'INVALID_CREDENTIALS',
        message: 'No active profile found matching this email address.'
      });
    }

    // Block login for deactivated (suspended) users scheduled for deletion
    if (user.status === 'SUSPENDED' && user.scheduledDeletionDate) {
      const deletionStr = user.scheduledDeletionDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      return res.status(403).json({
        code: 'ACCOUNT_DEACTIVATED',
        message: `Your corporate account has been deactivated and is scheduled for permanent deletion on ${deletionStr}.`
      });
    }

    // Verify OTP exists and matches
    if (!user.otp || user.otp !== otp) {
      return res.status(401).json({
        code: 'INVALID_OTP',
        message: 'Invalid verification OTP code. Please double-check your code.'
      });
    }

    // Check expiry
    if (user.otpExpires && new Date() > user.otpExpires) {
      return res.status(401).json({
        code: 'EXPIRED_OTP',
        message: 'The verification OTP code has expired. Please request a new login.'
      });
    }

    // Clean up OTP fields after successful verification
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Generate JWT containing permissions
    const permissions = getRolePermissions(user.role);
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role, 
        name: user.name, 
        email: user.email, 
        permissions: user.permissions,
        managerId: user.managerId
      },
      jwtSecret,
      { expiresIn: '8h' }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        doj: user.dateOfJoining.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        dob: user.dob,
        mobile: user.mobile,
        designation: user.designation,
        department: user.department,
        location: user.location,
        profilePic: user.profilePic,
        bankDetails: user.bankDetails,
        salary: user.salary,
        deductions: user.deductions,
        clBalance: user.clBalance,
        elBalance: user.elBalance,
        slBalance: user.slBalance,
        compOffBalance: user.compOffBalance
      }
    });

  } catch (error) {
    console.error('OTP verification operational failure:', error);
    res.status(500).json({
      code: 'VERIFY_FAILED',
      message: 'OTP verification processing encountered a server exception.'
    });
  }
});

// Forgot Password reset & dispatch endpoint
router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        code: 'USER_NOT_FOUND',
        message: 'No active profile found matching this email address.'
      });
    }

    // 1. Generate secure temporary password
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let generatedPassword = 'AIS-P@';
    for (let i = 0; i < 6; i++) {
      generatedPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // 2. Hash and save to database
    const passwordHash = await bcrypt.hash(generatedPassword, 10);
    user.password = passwordHash;
    // Clear any active OTP to reset security state
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // 3. Compose Reset Email
    const resetHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1a202c;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #ff6b00;">
          <h2 style="color: #ff6b00; margin: 0; font-size: 24px; letter-spacing: 1px;">ADAMMA INFO SERVICES PRIVATE LIMITED</h2>
          <p style="margin: 5px 0 0 0; font-size: 11px; text-transform: uppercase; color: #718096; font-weight: bold; font-family: monospace;">Password Recovery Portal</p>
        </div>
        
        <div style="padding: 30px 10px;">
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">Hello <strong>${user.name}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #4a5568; margin: 0 0 25px 0;">Your password recovery request has been successfully processed. A new temporary login password has been generated for your corporate account:</p>
          
          <div style="background-color: #f7fafc; border: 1px solid #edf2f7; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #718096; font-weight: bold; width: 35%;">Username (Email):</td>
                <td style="padding: 6px 0; font-weight: bold; color: #1a202c; font-family: monospace;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #718096; font-weight: bold;">New Temp Password:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #d69e2e; font-family: monospace; font-size: 14px; letter-spacing: 0.5px;">${generatedPassword}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin-bottom: 25px;">
            <a href="http://localhost:3000/login" style="background-color: #ff6b00; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(255, 107, 0, 0.2);">Access HRMS Portal</a>
          </div>

          <p style="font-size: 12px; line-height: 1.6; color: #718096; margin: 0;">
            <em>Security Notice:</em> Please log in using this new temporary password and change it immediately inside your profile settings dashboard.
          </p>
        </div>

        <div style="border-t: 1px solid #edf2f7; padding-top: 20px; font-size: 10px; color: #a0aec0; text-align: center; font-family: monospace;">
          This is an automated security recovery dispatch. Microsoft Graph API active.
        </div>
      </div>
    `;

    // 4. Send Email via MS Graph
    await sendGraphEmail(email, [], "Your Adamma HRMS Password Has Been Reset", resetHtml);
    console.log(`\n======================================================`);
    console.log(`[PASSWORD RESET] Generated New Password for ${email}: ${generatedPassword}`);
    console.log(`======================================================\n`);

    res.status(200).json({
      success: true,
      message: 'A new password has been successfully generated and sent to your email.'
    });

  } catch (error: any) {
    console.error('Password reset operational failure:', error);
    res.status(500).json({
      code: 'RESET_FAILED',
      message: 'Processing password recovery encountered a server exception.',
      details: error.message
    });
  }
});

// Deactivate User & Schedule Deletion Flow
router.post('/users/:id/deactivate', requirePermission('USER_CREATE'), async (req: any, res: Response) => {
  const { id } = req.params;

  try {
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({
        code: 'USER_NOT_FOUND',
        message: 'No active profile found matching this employee ID.'
      });
    }

    if (user.role === 'ADMIN') {
      return res.status(400).json({
        code: 'ADMIN_DEACTIVATION_BLOCKED',
        message: 'Deactivating or deleting the primary system Administrator account is prohibited.'
      });
    }

    // 1. Mark as SUSPENDED and configure timestamps
    user.status = 'SUSPENDED';
    user.deactivatedAt = new Date();
    
    // 10 days deletion date
    const deletionDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
    user.scheduledDeletionDate = deletionDate;
    user.deletionNotificationSent = false;
    await user.save();

    // 2. Format Deactivation Notification Email
    const formattedDeletionDate = deletionDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const deactivationHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1a202c;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #e53e3e;">
          <h2 style="color: #e53e3e; margin: 0; font-size: 24px; letter-spacing: 1px;">ADAMMA HRMS SECURITY PORTAL</h2>
          <p style="margin: 5px 0 0 0; font-size: 11px; text-transform: uppercase; color: #718096; font-weight: bold; font-family: monospace;">Account Deactivation Dispatch</p>
        </div>
        
        <div style="padding: 30px 10px;">
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">Hello <strong>${user.name}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #4a5568; margin: 0 0 25px 0;">We are writing to notify you that your Adamma corporate HRMS user console access has been **deactivated** by the system Administrator.</p>
          
          <div style="background-color: #fffaf0; border: 1px solid #feebc8; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #718096; font-weight: bold; width: 40%;">Account Status:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #e53e3e;">DEACTIVATED (SUSPENDED)</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #718096; font-weight: bold;">Deactivation Date:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #1a202c;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #718096; font-weight: bold;">Scheduled Permanent Deletion:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #dd6b20;">${formattedDeletionDate} (In 10 Days)</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 13px; line-height: 1.6; color: #718096; margin: 0 0 20px 0;">
            <strong>Important Notice:</strong> Your login coordinates have been immediately blocked. All your data files and directories are scheduled to be permanently deleted on the scheduled date.
          </p>
          
          <p style="font-size: 12px; line-height: 1.6; color: #e53e3e; margin: 0;">
            <em>Security Alert:</em> If you believe this is an error or want to retract this schedule, please contact your company Administrator immediately.
          </p>
        </div>

        <div style="border-top: 1px solid #edf2f7; padding-top: 20px; font-size: 10px; color: #a0aec0; text-align: center; font-family: monospace;">
          This is an automated system dispatch. Security policies active.
        </div>
      </div>
    `;

    // 3. Send Email via MS Graph
    await sendGraphEmail(user.email, [], "ADAMMA HRMS - Your Account Has Been Deactivated", deactivationHtml);
    console.log(`[DEACTIVATE] Deactivated user: ${user.email}. Scheduled for permanent deletion on ${formattedDeletionDate}.`);

    res.status(200).json({
      success: true,
      message: `Employee successfully deactivated. Account scheduled for permanent deletion in 10 days (${formattedDeletionDate}).`
    });

  } catch (error: any) {
    console.error('User deactivation operational failure:', error);
    res.status(500).json({
      code: 'DEACTIVATE_FAILED',
      message: 'Processing employee deactivation encountered a server exception.',
      details: error.message
    });
  }
});

// Change User Password Endpoint
router.post('/change-password', requirePermission('LEAVE_APPLY'), async (req: any, res: Response) => {
  const userId = req.user?.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      code: 'MISSING_FIELDS',
      message: 'Both current password and new custom password coordinates are required.'
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      code: 'PASSWORD_TOO_SHORT',
      message: 'Your new custom password must be at least 6 characters in length.'
    });
  }

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        code: 'USER_NOT_FOUND',
        message: 'No active profile found matching this session token.'
      });
    }

    // Verify current password if user has a password defined (onboarded/recovered users)
    if (user.password) {
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) {
        return res.status(400).json({
          code: 'INCORRECT_CURRENT_PASSWORD',
          message: 'The current password you entered is incorrect.'
        });
      }
    }

    // Hash and save new password
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    console.log(`[PASSWORD CHANGE] User ${user.email} successfully updated their password.`);

    res.status(200).json({
      success: true,
      message: 'Your account password has been successfully updated and secured.'
    });
  } catch (error: any) {
    console.error('Password change operational failure:', error);
    res.status(500).json({
      code: 'PASSWORD_CHANGE_FAILED',
      message: 'Processing password update encountered a server exception.',
      details: error.message
    });
  }
});

// Upload Profile Picture Endpoint
router.post('/profile-pic', requirePermission('LEAVE_APPLY'), async (req: any, res: Response) => {
  const userId = req.user?.id;
  const { profilePic } = req.body;

  if (!profilePic) {
    return res.status(400).json({
      code: 'MISSING_FIELDS',
      message: 'Base64 profile picture string coordinate is required.'
    });
  }

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        code: 'USER_NOT_FOUND',
        message: 'No active profile found matching this session token.'
      });
    }

    user.profilePic = profilePic;
    await user.save();

    console.log(`[PROFILE PIC] User ${user.email} successfully updated their profile picture.`);

    res.status(200).json({
      success: true,
      profilePic,
      message: 'Your profile picture has been successfully updated.'
    });
  } catch (error: any) {
    console.error('Profile picture update operational failure:', error);
    res.status(500).json({
      code: 'PROFILE_PIC_UPDATE_FAILED',
      message: 'Processing profile picture update encountered a server exception.',
      details: error.message
    });
  }
});

// Dynamic permissions assignment
function getRolePermissions(role: string): string[] {
  const adminRights = ['POLICY_EDIT', 'HOLIDAY_MANAGE', 'USER_CREATE', 'PAYROLL_VIEW', 'APPRAISAL_FINALIZE', 'ATTENDANCE_MARK', 'LEAVE_APPLY', 'APPRAISAL_SUBMIT'];
  const managerRights = ['LEAVE_APPROVE', 'APPRAISAL_REVIEW_MGR', 'ATTENDANCE_MARK', 'LEAVE_APPLY', 'APPRAISAL_SUBMIT'];
  const tlRights = ['LEAVE_APPROVE_TL', 'APPRAISAL_REVIEW_TL', 'ATTENDANCE_MARK', 'LEAVE_APPLY', 'APPRAISAL_SUBMIT'];
  const employeeRights = ['ATTENDANCE_MARK', 'LEAVE_APPLY', 'APPRAISAL_SUBMIT'];

  if (role === 'ADMIN') return adminRights;
  if (role === 'MANAGER') return managerRights;
  if (role === 'TL') return tlRights;
  return employeeRights;
}

export default router;
