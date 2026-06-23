export const CANONICAL_AWARDS = [
  "Picture",
  "Director",
  "Actor",
  "Actress",
  "Supporting Actor",
  "Supporting Actress",
  "Writing",
  "Cinematography",
  "Film Editing",
  "Production Design",
  "Costume Design",
  "Makeup & Hairstyling",
  "Sound",
  "Visual Effects",
  "Original Score",
  "Original Song",
  "Animated Feature",
  "Documentary",
  "International Feature",
  "Short Film",
  "Other",
] as const;

export type CanonicalAward = (typeof CANONICAL_AWARDS)[number];

const OSCAR_ALIAS_MAP: Record<string, CanonicalAward> = {
  // Picture
  "BEST MOTION PICTURE": "Picture",
  "BEST PICTURE": "Picture",
  "OUTSTANDING MOTION PICTURE": "Picture",
  "OUTSTANDING PICTURE": "Picture",
  "OUTSTANDING PRODUCTION": "Picture",
  "UNIQUE AND ARTISTIC PICTURE": "Picture",

  // Directing
  "DIRECTING": "Director",
  "DIRECTING (COMEDY PICTURE)": "Director",
  "DIRECTING (DRAMATIC PICTURE)": "Director",
  "ASSISTANT DIRECTOR": "Director",

  // Actor
  "ACTOR": "Actor",
  "ACTOR IN A LEADING ROLE": "Actor",
  "ACTRESS": "Actress",
  "ACTRESS IN A LEADING ROLE": "Actress",

  // Supporting
  "ACTOR IN A SUPPORTING ROLE": "Supporting Actor",
  "ACTRESS IN A SUPPORTING ROLE": "Supporting Actress",

  // Writing
  "WRITING": "Writing",
  "WRITING (ADAPTATION)": "Writing",
  "WRITING (ADAPTED SCREENPLAY)": "Writing",
  "WRITING (MOTION PICTURE STORY)": "Writing",
  "WRITING (ORIGINAL MOTION PICTURE STORY)": "Writing",
  "WRITING (ORIGINAL SCREENPLAY)": "Writing",
  "WRITING (ORIGINAL STORY)": "Writing",
  "WRITING (SCREENPLAY)": "Writing",
  "WRITING (SCREENPLAY ADAPTED FROM OTHER MATERIAL)": "Writing",
  "WRITING (SCREENPLAY BASED ON MATERIAL FROM ANOTHER MEDIUM)": "Writing",
  "WRITING (SCREENPLAY BASED ON MATERIAL PREVIOUSLY PRODUCED OR PUBLISHED)":
    "Writing",
  "WRITING (SCREENPLAY WRITTEN DIRECTLY FOR THE SCREEN)": "Writing",
  "WRITING (SCREENPLAY WRITTEN DIRECTLY FOR THE SCREEN--BASED ON FACTUAL MATERIAL OR ON STORY MATERIAL NOT PREVIOUSLY PUBLISHED OR PRODUCED)":
    "Writing",
  "WRITING (SCREENPLAY--ADAPTED)": "Writing",
  "WRITING (SCREENPLAY--BASED ON MATERIAL FROM ANOTHER MEDIUM)": "Writing",
  "WRITING (SCREENPLAY--ORIGINAL)": "Writing",
  "WRITING (STORY AND SCREENPLAY)": "Writing",
  "WRITING (STORY AND SCREENPLAY--BASED ON FACTUAL MATERIAL OR MATERIAL NOT PREVIOUSLY PUBLISHED OR PRODUCED)":
    "Writing",
  "WRITING (STORY AND SCREENPLAY--BASED ON MATERIAL NOT PREVIOUSLY PUBLISHED OR PRODUCED)":
    "Writing",
  "WRITING (STORY AND SCREENPLAY--WRITTEN DIRECTLY FOR THE SCREEN)": "Writing",

  // Cinematography
  "CINEMATOGRAPHY": "Cinematography",
  "CINEMATOGRAPHY (BLACK-AND-WHITE)": "Cinematography",
  "CINEMATOGRAPHY (COLOR)": "Cinematography",

  // Film Editing
  "FILM EDITING": "Film Editing",

  // Production Design
  "ART DIRECTION": "Production Design",
  "ART DIRECTION (BLACK-AND-WHITE)": "Production Design",
  "ART DIRECTION (COLOR)": "Production Design",
  "PRODUCTION DESIGN": "Production Design",
  "CASTING": "Production Design",
  "DANCE DIRECTION": "Production Design",

  // Costume Design
  "COSTUME DESIGN": "Costume Design",
  "COSTUME DESIGN (BLACK-AND-WHITE)": "Costume Design",
  "COSTUME DESIGN (COLOR)": "Costume Design",

  // Makeup & Hairstyling
  "MAKEUP": "Makeup & Hairstyling",
  "MAKEUP AND HAIRSTYLING": "Makeup & Hairstyling",

  // Sound
  "SOUND": "Sound",
  "SOUND EDITING": "Sound",
  "SOUND EFFECTS": "Sound",
  "SOUND EFFECTS EDITING": "Sound",
  "SOUND MIXING": "Sound",
  "SOUND RECORDING": "Sound",
  "SPECIAL ACHIEVEMENT AWARD (SOUND EDITING)": "Sound",
  "SPECIAL ACHIEVEMENT AWARD (SOUND EFFECTS EDITING)": "Sound",
  "SPECIAL ACHIEVEMENT AWARD (SOUND EFFECTS)": "Sound",

  // Visual Effects
  "ENGINEERING EFFECTS": "Visual Effects",
  "SPECIAL ACHIEVEMENT AWARD (VISUAL EFFECTS)": "Visual Effects",
  "SPECIAL EFFECTS": "Visual Effects",
  "SPECIAL VISUAL EFFECTS": "Visual Effects",
  "VISUAL EFFECTS": "Visual Effects",

  // Original Score
  "MUSIC (ADAPTATION SCORE)": "Original Score",
  "MUSIC (MUSIC SCORE OF A DRAMATIC PICTURE)": "Original Score",
  "MUSIC (MUSIC SCORE OF A DRAMATIC OR COMEDY PICTURE)": "Original Score",
  "MUSIC (MUSIC SCORE--SUBSTANTIALLY ORIGINAL)": "Original Score",
  "MUSIC (ORIGINAL DRAMATIC SCORE)": "Original Score",
  "MUSIC (ORIGINAL MUSIC SCORE)": "Original Score",
  "MUSIC (ORIGINAL MUSICAL OR COMEDY SCORE)": "Original Score",
  "MUSIC (ORIGINAL SCORE)": "Original Score",
  "MUSIC (ORIGINAL SCORE--FOR A MOTION PICTURE [NOT A MUSICAL])":
    "Original Score",
  "MUSIC (ORIGINAL SONG SCORE AND ITS ADAPTATION -OR- ADAPTATION SCORE)":
    "Original Score",
  "MUSIC (ORIGINAL SONG SCORE AND ITS ADAPTATION OR ADAPTATION SCORE)":
    "Original Score",
  "MUSIC (ORIGINAL SONG SCORE OR ADAPTATION SCORE)": "Original Score",
  "MUSIC (ORIGINAL SONG SCORE)": "Original Score",
  "MUSIC (SCORE OF A MUSICAL PICTURE--ORIGINAL OR ADAPTATION)": "Original Score",
  "MUSIC (SCORING OF MUSIC--ADAPTATION OR TREATMENT)": "Original Score",
  "MUSIC (SCORING OF A MUSICAL PICTURE)": "Original Score",
  "MUSIC (SCORING)": "Original Score",
  "MUSIC (SCORING: ADAPTATION AND ORIGINAL SONG SCORE)": "Original Score",
  "MUSIC (SCORING: ORIGINAL SONG SCORE AND ADAPTATION -OR- SCORING: ADAPTATION)":
    "Original Score",

  // Original Song
  "MUSIC (ORIGINAL SONG)": "Original Song",
  "MUSIC (SONG)": "Original Song",
  "MUSIC (SONG--ORIGINAL FOR THE PICTURE)": "Original Song",

  // Animated Feature
  "ANIMATED FEATURE FILM": "Animated Feature",

  // Documentary
  "DOCUMENTARY": "Documentary",
  "DOCUMENTARY (FEATURE)": "Documentary",
  "DOCUMENTARY (SHORT SUBJECT)": "Documentary",
  "DOCUMENTARY FEATURE FILM": "Documentary",
  "DOCUMENTARY SHORT FILM": "Documentary",

  // International Feature
  "FOREIGN LANGUAGE FILM": "International Feature",
  "HONORARY FOREIGN LANGUAGE FILM AWARD": "International Feature",
  "INTERNATIONAL FEATURE FILM": "International Feature",
  "SPECIAL FOREIGN LANGUAGE FILM AWARD": "International Feature",

  // Short Film
  "ANIMATED SHORT FILM": "Short Film",
  "SHORT FILM (ANIMATED)": "Short Film",
  "SHORT FILM (DRAMATIC LIVE ACTION)": "Short Film",
  "SHORT FILM (LIVE ACTION)": "Short Film",
  "SHORT SUBJECT (ANIMATED)": "Short Film",
  "SHORT SUBJECT (CARTOON)": "Short Film",
  "SHORT SUBJECT (COLOR)": "Short Film",
  "SHORT SUBJECT (COMEDY)": "Short Film",
  "SHORT SUBJECT (LIVE ACTION)": "Short Film",
  "SHORT SUBJECT (NOVELTY)": "Short Film",
  "SHORT SUBJECT (ONE-REEL)": "Short Film",
  "SHORT SUBJECT (TWO-REEL)": "Short Film",
  "LIVE ACTION SHORT FILM": "Short Film",

  // Other (honorary / special / technical commendations)
  "AWARD OF COMMENDATION": "Other",
  "HONORARY AWARD": "Other",
  "SCIENTIFIC OR TECHNICAL AWARD (CLASS III)": "Other",
  "SPECIAL ACHIEVEMENT AWARD": "Other",
  "SPECIAL AWARD": "Other",
};

export function normalizeAward(raw: string): CanonicalAward | undefined {
  const key = raw.trim().toUpperCase();
  return OSCAR_ALIAS_MAP[key];
}
