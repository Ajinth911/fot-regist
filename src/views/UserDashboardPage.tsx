import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserAuth } from '../hooks/useUserAuth';
import { IconArrowRight, IconTicket, IconCheck } from '../lib/icons';

export const UserDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, tickets, registrations, isAuthenticated, loading, logout, refreshUser } = useUserAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center text-xs text-[#55554F] font-mono">
        Loading attendee portal...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#0A0A0A] flex flex-col justify-between selection:bg-[#C2E600] selection:text-[#0A0A0A]">
      {/* Top Navbar */}
      <header className="w-full bg-[#FFFFFF] border-b border-[#E6E6DF] sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-lg font-bold tracking-tight text-[#0A0A0A]">
              Friends of Tech<span className="text-[#C2E600]">.</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-[#0A0A0A]">{user.name}</span>
              <span className="text-[11px] font-mono text-[#8C8C85]">{user.email}</span>
            </div>

            <button
              onClick={() => logout().then(() => navigate('/'))}
              className="h-9 px-4 bg-[#FAFAF7] hover:bg-[#F2F2EC] border border-[#E6E6DF] text-xs font-semibold rounded-xl text-[#0A0A0A] transition-colors cursor-pointer"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 space-y-10">
        {/* Welcome Banner */}
        <div className="bg-[#FFFFFF] border border-[#E6E6DF] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#F2F2EC] rounded-md text-[11px] font-mono text-[#55554F] font-semibold mb-3">
              <span>ATTENDEE PORTAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-[#0A0A0A]">
              Welcome, {user.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#55554F] mt-1.5 leading-relaxed max-w-xl">
              Here are your event passes, check-in QR codes, and registration history for Friends of Tech 2026.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/register"
              className="h-11 px-5 bg-[#0A0A0A] hover:bg-[#262626] text-[#FFFFFF] text-xs font-semibold rounded-xl inline-flex items-center gap-2 transition-all shadow-sm"
            >
              <span>Register New Pass</span>
              <span className="w-5 h-5 rounded-full bg-[#C2E600] text-[#0A0A0A] flex items-center justify-center">
                <IconArrowRight size={12} />
              </span>
            </Link>
          </div>
        </div>

        {/* Section 1: Official Passes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-bold tracking-tight text-[#0A0A0A] flex items-center gap-2">
              <IconTicket size={18} />
              <span>Your Official Passes ({tickets.length})</span>
            </h2>
            <button
              onClick={() => refreshUser()}
              className="text-xs text-[#8C8C85] hover:text-[#0A0A0A] font-mono transition-colors cursor-pointer"
            >
              Refresh
            </button>
          </div>

          {tickets.length === 0 ? (
            <div className="bg-[#FFFFFF] border border-[#E6E6DF] rounded-2xl p-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#F2F2EC] flex items-center justify-center mx-auto text-[#8C8C85]">
                <IconTicket size={24} />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-sm font-semibold text-[#0A0A0A]">No passes linked to this email yet</h3>
                <p className="text-xs text-[#55554F] leading-relaxed">
                  Passes are automatically linked to your account when an order is submitted or approved using your email ({user.email}).
                </p>
              </div>
              <div className="pt-2">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 h-10 px-5 bg-[#0A0A0A] hover:bg-[#262626] text-[#FFFFFF] text-xs font-semibold rounded-xl transition-all"
                >
                  <span>Submit Event Registration</span>
                  <IconArrowRight size={12} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  className="bg-[#FFFFFF] border border-[#E6E6DF] rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6 relative overflow-hidden"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[11px] font-mono text-[#8C8C85] tracking-wider uppercase font-semibold">
                          {t.ticket_code || 'PASS PENDING'}
                        </span>
                        <h3 className="text-xl font-bold font-display text-[#0A0A0A] mt-0.5">
                          {t.name}
                        </h3>
                      </div>

                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-lg font-mono uppercase ${
                          t.status === 'confirmed'
                            ? 'bg-[#C2E600]/20 text-[#0A0A0A] border border-[#C2E600]/40'
                            : t.status === 'rejected'
                            ? 'bg-[#FEE2E2] text-[#991B1B]'
                            : 'bg-[#FEF3C7] text-[#92400E]'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 py-3 border-y border-[#E6E6DF]/70 text-xs">
                      <div>
                        <span className="text-[#8C8C85] text-[11px] block font-mono">CATEGORY</span>
                        <span className="font-semibold text-[#0A0A0A]">{t.assigned_category}</span>
                      </div>
                      <div>
                        <span className="text-[#8C8C85] text-[11px] block font-mono">TEAM</span>
                        <span className="font-semibold text-[#0A0A0A]">{t.team_identifier || 'Solo'}</span>
                      </div>
                      <div>
                        <span className="text-[#8C8C85] text-[11px] block font-mono">CHECK-IN STATUS</span>
                        <span className="font-semibold text-[#0A0A0A]">
                          {t.is_checked_in ? (
                            <span className="text-[#059669] inline-flex items-center gap-1">
                              <IconCheck size={12} /> Checked In
                            </span>
                          ) : (
                            'Not Yet Checked In'
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#8C8C85] text-[11px] block font-mono">REGISTRATION ID</span>
                        <span className="font-mono text-[#55554F]">{t.registration_id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    {t.id_card_url ? (
                      <a
                        href={t.id_card_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 h-10 px-4 bg-[#0A0A0A] hover:bg-[#262626] text-[#FFFFFF] text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                      >
                        <span>View SVG Pass</span>
                        <IconArrowRight size={12} />
                      </a>
                    ) : (
                      <div className="flex-1 text-center py-2 text-xs text-[#8C8C85] font-medium bg-[#FAFAF7] rounded-xl border border-[#E6E6DF]">
                        Pass graphic generated upon admin confirmation
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Registration Orders */}
        {registrations.length > 0 && (
          <div className="space-y-4 pt-4">
            <h2 className="text-lg font-display font-bold tracking-tight text-[#0A0A0A]">
              Registration Orders ({registrations.length})
            </h2>

            <div className="bg-[#FFFFFF] border border-[#E6E6DF] rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAFAF7] border-b border-[#E6E6DF] text-[#55554F] font-mono uppercase text-[11px]">
                    <tr>
                      <th className="px-6 py-3.5">Order ID</th>
                      <th className="px-6 py-3.5">Payer</th>
                      <th className="px-6 py-3.5">Attendees</th>
                      <th className="px-6 py-3.5">Amount</th>
                      <th className="px-6 py-3.5">UTR / Ref</th>
                      <th className="px-6 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E6DF]">
                    {registrations.map((r) => (
                      <tr key={r.id} className="hover:bg-[#FAFAF7]/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-semibold text-[#0A0A0A]">{r.id}</td>
                        <td className="px-6 py-4 font-medium text-[#0A0A0A]">{r.payer_name}</td>
                        <td className="px-6 py-4 font-mono">{r.attendee_count} {r.attendee_count === 1 ? 'person' : 'people'}</td>
                        <td className="px-6 py-4 font-mono font-semibold">₹{r.total_amount}</td>
                        <td className="px-6 py-4 font-mono text-[#8C8C85]">{r.utr_number || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[11px] font-mono uppercase font-semibold ${
                              r.status === 'confirmed'
                                ? 'bg-[#C2E600]/20 text-[#0A0A0A]'
                                : r.status === 'rejected'
                                ? 'bg-[#FEE2E2] text-[#991B1B]'
                                : 'bg-[#FEF3C7] text-[#92400E]'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#FFFFFF] border-t border-[#E6E6DF] py-6 px-6 mt-12 text-center text-xs text-[#8C8C85]">
        &copy; 2026 Friends of Tech. Presented by GenLab Pvt Ltd.
      </footer>
    </div>
  );
};
