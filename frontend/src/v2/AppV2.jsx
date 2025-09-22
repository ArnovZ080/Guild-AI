import React from 'react';

function AppV2() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="text-xl font-semibold">Guild-AI v2</div>
          <div className="text-sm text-gray-500">Scaffold</div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold mb-2">Welcome to the new frontend</h1>
          <p className="text-gray-600">This is the minimal v2 shell. We will replace pages step by step.</p>
        </div>
      </main>
    </div>
  );
}

export default AppV2;


