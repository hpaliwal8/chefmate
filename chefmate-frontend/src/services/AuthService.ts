import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';

// Cognito configuration from environment variables
const USER_POOL_ID = process.env.REACT_APP_COGNITO_USER_POOL_ID || '';
const CLIENT_ID = process.env.REACT_APP_COGNITO_CLIENT_ID || '';

// Lazy initialization of User Pool - only create when both IDs are valid
let userPool: CognitoUserPool | null = null;

function getUserPool(): CognitoUserPool {
  if (!userPool) {
    if (!USER_POOL_ID || !CLIENT_ID) {
      throw new Error('Cognito is not configured. Please set REACT_APP_COGNITO_USER_POOL_ID and REACT_APP_COGNITO_CLIENT_ID.');
    }
    userPool = new CognitoUserPool({
      UserPoolId: USER_POOL_ID,
      ClientId: CLIENT_ID,
    });
  }
  return userPool;
}

export interface AuthUser {
  username: string;
  email: string;
  userId: string;
}

export interface AuthError {
  code: string;
  message: string;
}

/**
 * Check if Cognito is configured
 */
export function isCognitoConfigured(): boolean {
  return Boolean(USER_POOL_ID && CLIENT_ID);
}

/**
 * Sign up a new user
 */
export function signUp(email: string, password: string): Promise<CognitoUser> {
  return new Promise((resolve, reject) => {
    const attributeList = [
      new CognitoUserAttribute({
        Name: 'email',
        Value: email,
      }),
    ];

    getUserPool().signUp(
      email, // Use email as username
      password,
      attributeList,
      [],
      (err, result) => {
        if (err) {
          reject(formatError(err));
          return;
        }
        if (result?.user) {
          resolve(result.user);
        } else {
          reject({ code: 'UnknownError', message: 'Sign up failed' });
        }
      }
    );
  });
}

/**
 * Confirm sign up with verification code
 */
export function confirmSignUp(email: string, code: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: getUserPool(),
    });

    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        reject(formatError(err));
        return;
      }
      resolve();
    });
  });
}

/**
 * Resend confirmation code
 */
export function resendConfirmationCode(email: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: getUserPool(),
    });

    cognitoUser.resendConfirmationCode((err, result) => {
      if (err) {
        reject(formatError(err));
        return;
      }
      resolve();
    });
  });
}

/**
 * Sign in an existing user
 */
export function signIn(email: string, password: string): Promise<CognitoUserSession> {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: getUserPool(),
    });

    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (session) => {
        resolve(session);
      },
      onFailure: (err) => {
        reject(formatError(err));
      },
      newPasswordRequired: (userAttributes, requiredAttributes) => {
        // Handle new password required (first time login after admin creates user)
        reject({
          code: 'NewPasswordRequired',
          message: 'You must set a new password',
          userAttributes,
          requiredAttributes,
        });
      },
    });
  });
}

/**
 * Sign out the current user
 */
export function signOut(): void {
  if (!isCognitoConfigured()) return;
  const cognitoUser = getUserPool().getCurrentUser();
  if (cognitoUser) {
    cognitoUser.signOut();
  }
}

/**
 * Get the current authenticated user
 */
export function getCurrentUser(): Promise<AuthUser | null> {
  return new Promise((resolve, reject) => {
    if (!isCognitoConfigured()) {
      resolve(null);
      return;
    }

    const cognitoUser = getUserPool().getCurrentUser();

    if (!cognitoUser) {
      resolve(null);
      return;
    }

    cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session || !session.isValid()) {
        resolve(null);
        return;
      }

      cognitoUser.getUserAttributes((err, attributes) => {
        if (err) {
          reject(formatError(err));
          return;
        }

        const email = attributes?.find((attr) => attr.Name === 'email')?.Value || '';
        const userId = attributes?.find((attr) => attr.Name === 'sub')?.Value || '';

        resolve({
          username: cognitoUser.getUsername(),
          email,
          userId,
        });
      });
    });
  });
}

/**
 * Get the current session (with JWT tokens)
 */
export function getSession(): Promise<CognitoUserSession | null> {
  return new Promise((resolve, reject) => {
    if (!isCognitoConfigured()) {
      resolve(null);
      return;
    }

    const cognitoUser = getUserPool().getCurrentUser();

    if (!cognitoUser) {
      resolve(null);
      return;
    }

    cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err) {
        reject(formatError(err));
        return;
      }
      resolve(session);
    });
  });
}

/**
 * Get the JWT ID token for API calls
 */
export async function getIdToken(): Promise<string | null> {
  const session = await getSession();
  return session?.getIdToken()?.getJwtToken() || null;
}

/**
 * Get the JWT Access token
 */
export async function getAccessToken(): Promise<string | null> {
  const session = await getSession();
  return session?.getAccessToken()?.getJwtToken() || null;
}

/**
 * Forgot password - send reset code
 */
export function forgotPassword(email: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: getUserPool(),
    });

    cognitoUser.forgotPassword({
      onSuccess: () => {
        resolve();
      },
      onFailure: (err) => {
        reject(formatError(err));
      },
    });
  });
}

/**
 * Confirm forgot password with code and new password
 */
export function confirmForgotPassword(
  email: string,
  code: string,
  newPassword: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: getUserPool(),
    });

    cognitoUser.confirmPassword(code, newPassword, {
      onSuccess: () => {
        resolve();
      },
      onFailure: (err) => {
        reject(formatError(err));
      },
    });
  });
}

/**
 * Format Cognito errors into a consistent format
 */
function formatError(err: unknown): AuthError {
  if (err && typeof err === 'object' && 'code' in err && 'message' in err) {
    const cognitoErr = err as { code: string; message: string };
    return {
      code: cognitoErr.code,
      message: cognitoErr.message,
    };
  }
  return {
    code: 'UnknownError',
    message: err instanceof Error ? err.message : 'An unknown error occurred',
  };
}

export default {
  isCognitoConfigured,
  signUp,
  confirmSignUp,
  resendConfirmationCode,
  signIn,
  signOut,
  getCurrentUser,
  getSession,
  getIdToken,
  getAccessToken,
  forgotPassword,
  confirmForgotPassword,
};
