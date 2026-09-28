export type RoomType =
    | 'empty'
    | 'blocked'      // La X rossa per muri ciechi / rocce / vuoto
    | 'normal'
    | 'start'
    | 'boss'
    | 'shop'
    | 'curse'
    | 'secret'       // Se già trovata e piazzata
    | 'super_secret' // Se già trovata e piazzata
    | 'ultra_secret' // Se già trovata e piazzata
    | 'red'          // Red Room piazzata
    | 'special';     // Raggruppa: treasure, planetarium, sacrifice, library, arcade, vault, miniboss, challenge, dice, bedroom

export type ActiveSecretMode = 'none' | 'secret' | 'super_secret' | 'ultra_secret';

export interface CellAnalysis {
    score: number;
    percentage: number;
    reasons: string[];
}

export type AnalysisGrid = (CellAnalysis | null)[][];