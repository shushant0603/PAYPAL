import { Navigate, Route, Routes } from 'react-router-dom'
import WorkspaceShell from './components/WorkspaceShell'
import AuthPage from './components/AuthPage'
import {
  AIAssistantPage,
  ClientDetailsPage,
  ClientsPage,
  DashboardPage,
  InvoiceDetailsPage,
  InvoicesPage,
  PublicInvoicePage,
} from './pages/WorkspacePages'
import ProjectsPage from './pages/ProjectsPage'
import { WorkspaceProvider } from './context/WorkspaceContext'
import './App.css'

export default function App() {
  return (
    <WorkspaceProvider>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/public/invoices/:invoiceId" element={<PublicInvoicePage />} />
        <Route element={<WorkspaceShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="clients/:clientId" element={<ClientDetailsPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="invoices/new" element={<Navigate to="/assistant" replace />} />
          <Route path="invoices/:invoiceId" element={<InvoiceDetailsPage />} />
          <Route path="assistant" element={<AIAssistantPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/clients" replace />} />
      </Routes>
    </WorkspaceProvider>
  )
}