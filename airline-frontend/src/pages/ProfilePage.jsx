import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { profileAPI } from '../api/axios';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [form, setForm]       = useState({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    profileAPI.get()
      .then(({ data }) => {
        setProfile(data.data);
        setForm({
          firstName:      data.data.firstName      || '',
          lastName:       data.data.lastName       || '',
          phone:          data.data.phone          || '',
          dateOfBirth:    data.data.dateOfBirth    || '',
          nationality:    data.data.nationality    || '',
          passportNumber: data.data.passportNumber || '',
          preferredSeat:  data.data.preferredSeat  || '',
          mealPreference: data.data.mealPreference || '',
        });
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await profileAPI.update(form);
      setProfile(data.data);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="loading-screen">Loading profile…</div>;

  return (
    <div className="page-container">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
          </div>
          <div className="profile-title">
            <h1>{profile.firstName} {profile.lastName}</h1>
            <span className="profile-role-badge">{profile.role}</span>
          </div>
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-value">{profile.totalBookings}</span>
              <span className="stat-label">Bookings</span>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <div className="profile-card-header">
            <h2>Personal Information</h2>
            {!editing && (
              <button className="btn-outline btn-sm" onClick={() => setEditing(true)}>
                Edit Profile
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSave} className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input name="firstName" value={form.firstName} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input name="lastName" value={form.lastName} onChange={handleChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91XXXXXXXXXX" />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Nationality</label>
                  <input name="nationality" value={form.nationality} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Passport Number</label>
                  <input name="passportNumber" value={form.passportNumber} onChange={handleChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Preferred Seat</label>
                  <select name="preferredSeat" value={form.preferredSeat} onChange={handleChange}>
                    <option value="">No preference</option>
                    <option value="WINDOW">Window</option>
                    <option value="AISLE">Aisle</option>
                    <option value="MIDDLE">Middle</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Meal Preference</label>
                  <select name="mealPreference" value={form.mealPreference} onChange={handleChange}>
                    <option value="">No preference</option>
                    <option value="VEGETARIAN">Vegetarian</option>
                    <option value="NON_VEG">Non-Vegetarian</option>
                    <option value="VEGAN">Vegan</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                <button type="button" className="btn-outline" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-info-grid">
              {[
                ['Email',           profile.email],
                ['Phone',           profile.phone          || '—'],
                ['Date of Birth',   profile.dateOfBirth    || '—'],
                ['Nationality',     profile.nationality    || '—'],
                ['Passport',        profile.passportNumber || '—'],
                ['Preferred Seat',  profile.preferredSeat  || '—'],
                ['Meal Preference', profile.mealPreference || '—'],
                ['Member Since',    profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'],
              ].map(([label, value]) => (
                <div key={label} className="info-item">
                  <span className="info-label">{label}</span>
                  <span className="info-value">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
