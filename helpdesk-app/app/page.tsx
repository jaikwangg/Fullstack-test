'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { TicketStatus } from '@prisma/client'

interface Ticket {
  id: string
  title: string
  description: string
  contactInfo: string
  status: TicketStatus
  createdAt: string
  updatedAt: string
}

const statusColumns: Record<TicketStatus, Ticket[]> = {
  PENDING: [],
  ACCEPTED: [],
  RESOLVED: [],
  REJECTED: [],
}

export default function Home() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [columns, setColumns] = useState(statusColumns)
  const [isCreatingTicket, setIsCreatingTicket] = useState(false)
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    contactInfo: '',
  })
  const [filterStatus, setFilterStatus] = useState<TicketStatus | 'ALL'>('ALL')
  const [sortBy, setSortBy] = useState<'updatedAt' | 'createdAt'>('updatedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetchTickets()
  }, [filterStatus, sortBy, sortOrder])

  useEffect(() => {
    const newColumns = { ...statusColumns }
    if (Array.isArray(tickets)) {
      // Clear all columns first
      Object.keys(newColumns).forEach((status) => {
        newColumns[status as TicketStatus] = []
      })
      
      // Then add tickets to their respective columns
      tickets.forEach((ticket) => {
        if (filterStatus === 'ALL' || ticket.status === filterStatus) {
          newColumns[ticket.status].push(ticket)
        }
      })
    }
    setColumns(newColumns)
  }, [tickets, filterStatus])

  const fetchTickets = async () => {
    try {
      const params = new URLSearchParams()
      if (filterStatus !== 'ALL') {
        params.append('status', filterStatus)
      }
      params.append('sortBy', sortBy)
      params.append('order', sortOrder)

      const response = await fetch(`/api/tickets?${params.toString()}`)
      const data = await response.json()
      setTickets(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching tickets:', error)
      setTickets([])
    }
  }

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result
    if (source.droppableId === destination.droppableId) return

    const ticket = tickets.find((t) => t.id === draggableId)
    if (!ticket) return

    const newStatus = destination.droppableId as TicketStatus
    try {
      const response = await fetch(`/api/tickets/${draggableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        const updatedTicket = await response.json()
        setTickets(tickets.map((t) => (t.id === draggableId ? updatedTicket : t)))
      }
    } catch (error) {
      console.error('Error updating ticket:', error)
    }
  }

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicket),
      })

      if (response.ok) {
        const ticket = await response.json()
        setTickets([...tickets, ticket])
        setIsCreatingTicket(false)
        setNewTicket({ title: '', description: '', contactInfo: '' })
      }
    } catch (error) {
      console.error('Error creating ticket:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Helpdesk Tickets</h1>
        <button
          onClick={() => setIsCreatingTicket(true)}
          className="btn btn-primary"
        >
          Create New Ticket
        </button>
      </div>

      <div className="mb-6 flex gap-4 items-center">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as TicketStatus | 'ALL')}
          className="input"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="RESOLVED">Resolved</option>
          <option value="REJECTED">Rejected</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'updatedAt' | 'createdAt')}
          className="input"
        >
          <option value="updatedAt">Last Updated</option>
          <option value="createdAt">Created Date</option>
        </select>

        <button
          onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          className="btn btn-secondary"
        >
          {sortOrder === 'desc' ? '↓' : '↑'}
        </button>
      </div>

      {isCreatingTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create New Ticket</h2>
            <form onSubmit={handleCreateTicket}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={newTicket.title}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    className="input"
                    value={newTicket.description}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, description: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contact Information
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={newTicket.contactInfo}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, contactInfo: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreatingTicket(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* @ts-ignore - Working around type issues with React Beautiful DnD */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className={`grid gap-6 ${
          filterStatus === 'ALL' 
            ? 'grid-cols-1 md:grid-cols-4' 
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        }`}>
          {Object.entries(columns)
            .filter(([status]) => filterStatus === 'ALL' || status === filterStatus)
            .map(([status, columnTickets]) => (
            <div key={status} className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">{status}</h2>
              {/* @ts-ignore - Working around type issues with React Beautiful DnD */}
              <Droppable droppableId={status}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-4"
                  >
                    {columnTickets
                      .filter(ticket => filterStatus === 'ALL' || ticket.status === filterStatus)
                      .map((ticket, index) => (
                      /* @ts-ignore - Working around type issues with React Beautiful DnD */
                      <Draggable
                        key={ticket.id}
                        draggableId={ticket.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white p-4 rounded-lg shadow"
                          >
                            <h3 className="font-medium">{ticket.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {ticket.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              Contact: {ticket.contactInfo}
                            </p>
                            <div className="mt-2 text-xs text-gray-400">
                              <p>Created: {formatDate(ticket.createdAt)}</p>
                              <p>Updated: {formatDate(ticket.updatedAt)}</p>
                            </div>
                            <div className="mt-2">
                              <select
                                value={ticket.status}
                                onChange={async (e) => {
                                  const newStatus = e.target.value as TicketStatus
                                  try {
                                    const response = await fetch(`/api/tickets/${ticket.id}`, {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ status: newStatus }),
                                    })

                                    if (response.ok) {
                                      const updatedTicket = await response.json()
                                      setTickets(tickets.map((t) => (t.id === ticket.id ? updatedTicket : t)))
                                    }
                                  } catch (error) {
                                    console.error('Error updating ticket:', error)
                                  }
                                }}
                                className="text-xs border border-gray-300 rounded px-1 py-0.5"
                              >
                                <option value="PENDING">Pending</option>
                                <option value="ACCEPTED">Accepted</option>
                                <option value="RESOLVED">Resolved</option>
                                <option value="REJECTED">Rejected</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {/* @ts-ignore - Working around type issues with React Beautiful DnD */}
                    <>{provided.placeholder}</>
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
} 