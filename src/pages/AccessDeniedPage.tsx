import React from 'react'
import { Lock, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

/**
 * Access Denied Page
 * 
 * Displayed when users try to access admin resources without proper permissions
 */
export const AccessDeniedPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* Lock Icon */}
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          
          {/* Error Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-lg text-gray-600 mb-8">
            You don't have permission to access this resource.
          </p>
          
          {/* Explanation */}
          <div className="bg-white rounded-lg shadow p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Possible reasons:</h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                Your account doesn't have admin privileges
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                You're trying to access admin-specific features
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                Your session may have expired
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                Your account has been deactivated
              </li>
            </ul>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go to Homepage</span>
            </button>
            
            <button
              onClick={() => navigate('/login')}
              className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Sign In with Different Account
            </button>
          </div>
          
          {/* Help Text */}
          <p className="mt-8 text-sm text-gray-500">
            If you believe this is an error, please contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AccessDeniedPage
