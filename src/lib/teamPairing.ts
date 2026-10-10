import type { AttendeeInput } from '../types';

export interface TeamGroup {
  teamNumber: number;
  teamIdentifier: string;
  members: AttendeeInput[];
}

export interface ComputedTeamPairing {
  teams: TeamGroup[];
  solos: AttendeeInput[];
  oddPersonId: string | null;
  oddPersonNotice: boolean;
  oddOneOutId: string | null;
  totalPeople: number;
  teamCount: number;
  soloCount: number;
  summaryText: string;
}

export function computePairing(attendees: AttendeeInput[]): ComputedTeamPairing {
  const teamAttendees = attendees.filter((a) => a.category === 'TEAM');
  const explicitSolos = attendees.filter((a) => a.category === 'SOLO');

  const teams: TeamGroup[] = [];
  const convertedSolos: AttendeeInput[] = [];
  let oddPersonId: string | null = null;

  let teamIndex = 1;
  for (let i = 0; i < teamAttendees.length; i += 2) {
    if (i + 1 < teamAttendees.length) {
      teams.push({
        teamNumber: teamIndex,
        teamIdentifier: `TEAM ${String(teamIndex).padStart(2, '0')}`,
        members: [teamAttendees[i], teamAttendees[i + 1]],
      });
      teamIndex++;
    } else {
      // Odd one out: converted to SOLO
      const odd = teamAttendees[i];
      oddPersonId = odd.id;
      convertedSolos.push(odd);
    }
  }

  const allSolos = [...explicitSolos, ...convertedSolos];

  // Natural language grammar
  const peopleCount = attendees.length;
  const peopleStr = peopleCount === 1 ? '1 person' : `${peopleCount} people`;
  const teamStr = teams.length === 1 ? '1 team' : `${teams.length} teams`;
  const soloStr = allSolos.length === 1 ? '1 solo' : `${allSolos.length} solos`;

  let summaryText = peopleStr;
  if (teams.length > 0 && allSolos.length > 0) {
    summaryText = `${peopleStr} · ${teamStr} · ${soloStr}`;
  } else if (teams.length > 0) {
    summaryText = `${peopleStr} · ${teamStr}`;
  } else {
    summaryText = `${peopleStr} · ${soloStr}`;
  }

  return {
    teams,
    solos: allSolos,
    oddPersonId,
    oddPersonNotice: !!oddPersonId,
    oddOneOutId: oddPersonId,
    totalPeople: peopleCount,
    teamCount: teams.length,
    soloCount: allSolos.length,
    summaryText,
  };
}

export const computeTeamPairings = computePairing;
