import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminPanel({ userEmail }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await axios.get("/api/admin/users", { params: { email: userEmail } });
    setUsers(res.data);
  };

  const togglePayment = async (id) => {
    await axios.post(`/api/admin/toggle/${id}`, { email: userEmail });
    fetchUsers(); // refresh list
  };

  return (
    <div>
      <h1>Admin Panel</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Paid?</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.hasPaid ? "✅" : "❌"}</td>
              <td>
                <button onClick={() => togglePayment(u._id)}>
                  Toggle Payment
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
