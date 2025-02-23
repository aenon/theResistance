export interface Player {
    id: string;
    name: string;
    role: Role;
    isAlive: boolean;
}

export enum Role {
    MERLIN = 'Merlin',
    PERCIVAL = 'Percival',
    ASSASSIN = 'Assassin',
    MINION = 'Minion',
    RESISTANCE = 'Resistance',
}

export interface GameState {
    players: Player[];
    currentRound: number;
    votes: Record<string, boolean>;
    missionSuccesses: number;
    missionFailures: number;
    isGameOver: boolean;
}

export interface Vote {
    playerId: string;
    accepted: boolean;
}

export interface Mission {
    id: number;
    leaderId: string;
    team: Player[];
    votes: Vote[];
    success: boolean;
}