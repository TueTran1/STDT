import React from 'react'
import { useAuth } from '../contexts/AuthContext'

export const HomePage: React.FC = () => {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Welcome to STDT</h1>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
          
          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">User Profile</h2>
            <div className="space-y-2">
              <p className="text-gray-600">
                <span className="font-medium">Username:</span> {user?.displayName || 'N/A'}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">User ID:</span> {user?.uid || 'N/A'}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Role:</span> {user?.role || 'N/A'}
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Dashboard</h3>
              <p className="text-gray-600">View your dashboard and analytics</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Settings</h3>
              <p className="text-gray-600">Manage your account settings</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Help</h3>
              <p className="text-gray-600">Get help and support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
