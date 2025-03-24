'use client';

import { useState, useEffect } from 'react';
import { Ticket, TicketStatus, UserRole } from '@prisma/client'; 
import { useUser } from './context/UserContext';

const statusColors = {
  PENDING: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  ACCEPTED: 'bg-blue-50 text-blue-800 border-blue-200',
  RESOLVED: 'bg-green-50 text-green-800 border-green-200',
  REJECTED: 'bg-red-50 text-red-800 border-red-200',
}

const statusColumns: Record<TicketStatus, Ticket[]> = {
  PENDING: [],
  ACCEPTED: [],
  RESOLVED: [],
  REJECTED: [],
};

export default function Home() {
  const { user, openLoginModal, login, logout, isLoading } = useUser();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [columns, setColumns] = useState(statusColumns);

  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<TicketStatus | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'updatedAt' | 'createdAt'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    contactInfo: '',
  });

  const [isEditingTicket, setIsEditingTicket] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);

  const [confirmingStatusChange, setConfirmingStatusChange] = useState<{
    ticket: Ticket;
    newStatus: TicketStatus;
  } | null>(null);

  //admin assign to employee
  const [isAssigning, setIsAssigning] = useState(false);
  const [assigningTicket, setAssigningTicket] = useState<Ticket | null>(null);
  const [employeeList, setEmployeeList] = useState<{ id: string; username: string }[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');

  useEffect(() => {
    if (!user && !isLoading) {
      openLoginModal();
    }
  }, [user, isLoading, openLoginModal]);

  useEffect(() => {
    fetchTickets();
  }, [filterStatus, sortBy, sortOrder]);

  useEffect(() => {
    const newColumns = { ...statusColumns };
    if (Array.isArray(tickets)) {
      Object.keys(newColumns).forEach((status) => {
        newColumns[status as TicketStatus] = [];
      });

      tickets.forEach((ticket) => {
        if (filterStatus === 'ALL' || ticket.status === filterStatus) {
          newColumns[ticket.status].push(ticket);
        }
      });
    }
    setColumns(newColumns);
  }, [tickets, filterStatus]);

  async function fetchTickets() {
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'ALL') {
        params.append('status', filterStatus);
      }
      params.append('sortBy', sortBy);
      params.append('order', sortOrder);

      const response = await fetch(`/api/tickets?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }
      const data = await response.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setError('Failed to load tickets. Please try again.');
      setTickets([]);
    }
  }

  async function handleCreateTicket(e: React.FormEvent) {
    e.preventDefault();
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicket),
      });
      if (!response.ok) throw new Error('Error creating ticket');

      const ticket = await response.json();
      setTickets((prev) => [...prev, ticket]);
      setIsCreatingTicket(false);
      setNewTicket({ title: '', description: '', contactInfo: '' });
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  }

  async function handleEditTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTicket) return;
    try {
      const response = await fetch(`/api/tickets/${editingTicket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingTicket.title,
          description: editingTicket.description,
          contactInfo: editingTicket.contactInfo,
        }),
      });
      if (!response.ok) throw new Error('Error updating ticket');

      const updatedTicket = await response.json();
      setTickets((prev) =>
        prev.map((t) => (t.id === editingTicket.id ? updatedTicket : t))
      );
      setIsEditingTicket(false);
      setEditingTicket(null);
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  }

  async function handleStatusChange(ticket: Ticket, newStatus: TicketStatus) {
    try {
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        throw new Error('Failed to update ticket status');
      }
      const updatedTicket = await response.json();
      setTickets((prev) =>
        prev.map((t) => (t.id === ticket.id ? updatedTicket : t))
      );
      setConfirmingStatusChange(null);
    } catch (error) {
      console.error('Error updating ticket:', error);
      setError('Failed to update ticket status. Please try again.');
    }
  }

  async function handleOpenAssignModal(ticket: Ticket) {
    setAssigningTicket(ticket);
    setIsAssigning(true);

    try {
      const res = await fetch('/api/users?role=EMPLOYEE'); 
      if (res.ok) {
        const employees = await res.json();
        setEmployeeList(employees);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  }

  async function handleAssignTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!assigningTicket) return;
    try {
      const response = await fetch(`/api/tickets/${assigningTicket.id}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acceptedById: selectedEmployeeId }),
      });
      if (!response.ok) {
        throw new Error('Failed to assign ticket');
      }
      const updatedTicket = await response.json();
      setTickets((prev) =>
        prev.map((t) => (t.id === assigningTicket.id ? updatedTicket : t))
      );
      setIsAssigning(false);
      setAssigningTicket(null);
      setSelectedEmployeeId('');
    } catch (error) {
      console.error('Error assigning ticket:', error);
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString();
  }

  async function handleLogin(username: string, password: string) {
    try {
      await login(username, password);
      fetchTickets();
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please check your credentials and try again.');
    }
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Helpdesk Tickets</h1>
        <div className="flex items-center space-x-4">
        {user && user.role === UserRole.USER && (
          <button
            onClick={() => setIsCreatingTicket(true)}
            className="btn btn-primary"
          >
            Create New Ticket
          </button>
        )}

        {user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className="p-2 rounded-full hover:bg-gray-200 focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.477 2 12c0 5.523
                    4.477 10 10 10s10-4.477 10-10S17.523
                    2 12 2zm0 3a3 3 0 110 6 3 3 0 010-6zm0
                    14.2a7.2 7.2 0 01-5.998-3.2 5.2 5.2 0
                    0111.996 0A7.2 7.2 0 0112 19.2z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-md z-10">
                  <div className="p-2 border-b">
                    <p className="text-sm font-medium">username : {user.username}</p>
                    <p className="text-sm font-medium">role : {user.role}</p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={openLoginModal} className="btn btn-secondary">
              Login
            </button>
          )}
        </div>
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

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div
        className={`grid gap-6 ${
          filterStatus === 'ALL'
            ? 'grid-cols-1 md:grid-cols-4'
            : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
        }`}
      >
        {Object.entries(columns)
          .filter(([status]) => filterStatus === 'ALL' || status === filterStatus)
          .map(([status, columnTickets]) => (
            <div
              key={status}
              className={`bg-gray-50 p-4 rounded-lg ${
                filterStatus !== 'ALL' ? 'col-span-full' : ''
              }`}
            >
              <h2 className="text-lg font-semibold mb-4">{status}</h2>
              <div
                className={`grid gap-4 ${
                  filterStatus !== 'ALL'
                    ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                    : 'space-y-4'
                }`}
              >
                {columnTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`bg-white p-4 rounded-lg shadow border ${statusColors[ticket.status]}`}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{ticket.title}</h3>

                      {user &&
                        (user.role === UserRole.EMPLOYEE ||
                          user.role === UserRole.ADMIN) && (
                          <button
                            onClick={() => {
                              setEditingTicket(ticket);
                              setIsEditingTicket(true);
                            }}
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
                      <p>Created: {formatDate(ticket.createdAt.toString())}</p>
                      <p>Updated: {formatDate(ticket.updatedAt.toString())}</p>
                    </div>

                    {ticket.acceptedById && (
                      <p className="text-xs mt-2">
                        Assigned to: <strong>{ticket.acceptedById}</strong>
                      </p>
                    )}

                    {user &&
                      (user.role === UserRole.EMPLOYEE ||
                        user.role === UserRole.ADMIN) && (
                        <div className="mt-2">
                          <select
                            value={ticket.status}
                            onChange={(e) => {
                              const newStatus = e.target.value as TicketStatus;
                              setConfirmingStatusChange({ ticket, newStatus });
                            }}
                            className="text-xs border border-gray-300 rounded px-1 py-0.5"
                          >
                            <option value="PENDING">Pending</option>
                            <option value="ACCEPTED">Accepted</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="REJECTED">Rejected</option>
                          </select>
                        </div>
                      )}

                    {user && user.role === UserRole.ADMIN && (
                      <div className="mt-2">
                        <button
                          onClick={() => handleOpenAssignModal(ticket)}
                          className="btn btn-secondary text-xs"
                        >
                          Assign to Employee
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>

      {isCreatingTicket && user && user.role === UserRole.USER && (
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
                      setNewTicket((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
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
                      setNewTicket((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
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
                      setNewTicket((prev) => ({
                        ...prev,
                        contactInfo: e.target.value,
                      }))
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

      {isEditingTicket && editingTicket && user && user.role === UserRole.USER && editingTicket.userId === user.id && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Ticket</h2>
            <form onSubmit={handleEditTicket}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={editingTicket.title}
                    onChange={(e) =>
                      setEditingTicket((prev) =>
                        prev ? { ...prev, title: e.target.value } : null
                      )
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
                    value={editingTicket.description}
                    onChange={(e) =>
                      setEditingTicket((prev) =>
                        prev ? { ...prev, description: e.target.value } : null
                      )
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
                    value={editingTicket.contactInfo}
                    onChange={(e) =>
                      setEditingTicket((prev) =>
                        prev ? { ...prev, contactInfo: e.target.value } : null
                      )
                    }
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingTicket(false);
                    setEditingTicket(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmingStatusChange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirm Status Change</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to change the status of "
              {confirmingStatusChange.ticket.title}" to{' '}
              {confirmingStatusChange.newStatus}?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmingStatusChange(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleStatusChange(
                    confirmingStatusChange.ticket,
                    confirmingStatusChange.newStatus
                  )
                }
                className="btn btn-primary"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {isAssigning && assigningTicket && user && user.role === UserRole.ADMIN && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Assign Ticket</h2>
            <p className="text-gray-600 mb-4">
              Assign <strong>{assigningTicket.title}</strong> to:
            </p>
            <form onSubmit={handleAssignTicket}>
              <select
                className="input w-full"
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                required
              >
                <option value="">Select an employee</option>
                {employeeList.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.username}
                  </option>
                ))}
              </select>
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAssigning(false);
                    setAssigningTicket(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
