'use client'

import { Ticket, TicketStatus, UserRole } from '@prisma/client'
import { useUser } from '../context/UserContext'

interface TicketCardProps {
  ticket: Ticket
  onEdit: (ticket: Ticket) => void
  onStatusChange: (ticket: Ticket, newStatus: TicketStatus) => void
}

const statusColors = {
  PENDING: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  ACCEPTED: 'bg-blue-50 text-blue-800 border-blue-200',
  RESOLVED: 'bg-green-50 text-green-800 border-green-200',
  REJECTED: 'bg-red-50 text-red-800 border-red-200',
}

const statusTransitions: Record<TicketStatus, TicketStatus[]> = {
  PENDING: ['ACCEPTED', 'REJECTED'],
  ACCEPTED: ['RESOLVED', 'REJECTED'],
  RESOLVED: [],
  REJECTED: [],
}

export default function TicketCard({ ticket, onEdit, onStatusChange }: TicketCardProps) {
  const { user } = useUser()
  const canEdit = user?.role === UserRole.ADMIN || user?.id === ticket.userId
  const canAccept = user?.role === UserRole.EMPLOYEE && ticket.status === 'PENDING'
  const canResolve = user?.role === UserRole.EMPLOYEE && ticket.status === 'ACCEPTED'

  const availableStatuses = statusTransitions[ticket.status]

  return (
    <div className={`bg-white p-4 rounded-lg shadow border ${statusColors[ticket.status]}`}>
      <div className="flex justify-between items-start">
        <h3 className="font-medium">{ticket.title}</h3>
        {canEdit && (
          <button
            onClick={() => onEdit(ticket)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Edit
          </button>
        )}
      </div>
      <p className="text-sm text-gray-600 mt-1">
        {ticket.description}
      </p>
      <p className="text-xs text-gray-500 mt-2">
        Contact: {ticket.contactInfo}
      </p>
      <div className="mt-2 text-xs text-gray-400">
        <p>Created: {new Date(ticket.createdAt).toLocaleString()}</p>
        <p>Updated: {new Date(ticket.updatedAt).toLocaleString()}</p>
      </div>
      <div className="mt-2">
        <select
          value={ticket.status}
          onChange={(e) => {
            const newStatus = e.target.value as TicketStatus
            onStatusChange(ticket, newStatus)
          }}
          className={`text-xs border rounded px-1 py-0.5 ${statusColors[ticket.status]}`}
          disabled={!availableStatuses.length}
        >
          <option value={ticket.status}>{ticket.status}</option>
          {availableStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
} 