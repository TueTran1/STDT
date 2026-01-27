import React, { useState, memo } from 'react'
import { LeaderProfileDialog } from './LeaderProfileDialog'

// ========================================
//   FUTURE-PROOF LEADER INTERFACES
// ========================================

/**
 * Base timeline item for career progression
 * Firestore compatible structure
 */
export interface TimelineItem {
  year: string
  title: string
  description: string
}

/**
 * Personal information structure
 * Firestore compatible with proper data types
 */
export interface PersonalInfo {
  fullName: string
  birthDate: string
  partyJoinDate: string
  hometown: string
  positions: string[]
  politicalTheoryLevel: string
  professionalLevel: string
}

/**
 * Core leader profile interface
 * Designed for Firestore compatibility and extensibility
 */
export interface LeaderProfile {
  id: string
  name: string
  image: string
  currentTitles: string[]
  personalInfo: PersonalInfo
  careerTimeline: TimelineItem[]
}

/**
 * Extended leader profile for different military branches
 * Can be extended for Hải quân, Lữ đoàn 83, etc.
 */
export interface ExtendedLeaderProfile extends LeaderProfile {
  // Branch-specific extensions
  branch?: 'quân đội' | 'hải quân' | 'không quân' | 'lữ đoàn' | 'sở chỉ huy'
  unit?: string // e.g., "Lữ đoàn 83", "Hạm đội 5", etc.
  serviceNumber?: string
  specialization?: string[]
  
  // Additional optional fields for future extensions
  awards?: string[]
  training?: string[]
  foreignLanguages?: string[]
  publications?: string[]
  
  // Metadata for Firestore
  createdAt?: string
  updatedAt?: string
  isActive?: boolean
}

/**
 * Navy Leader specific interface
 */
export interface NavyLeader extends ExtendedLeaderProfile {
  branch: 'hải quân'
  shipCommand?: string
  navalRank?: string
  seaServiceYears?: number
}

/**
 * Division 83 Commander specific interface
 */
export interface Division83Commander extends ExtendedLeaderProfile {
  branch: 'lữ đoàn'
  unit: 'Lữ đoàn 83'
  divisionRole?: string
  commandPeriod?: {
    start: string
    end?: string
  }
  operations?: string[]
}

/**
 * Generic leader list component props
 * Works with any leader type extending LeaderProfile
 */
export interface LeaderListProps<T extends LeaderProfile> {
  leaders: T[]
  onLeaderClick?: (leader: T) => void
  className?: string
}

/**
 * Factory function to create leader-specific lists
 * Future-proof for different leader types
 */
export function createLeaderList<T extends LeaderProfile>(
  LeaderComponent: React.FC<LeaderListProps<T>>
) {
  return LeaderComponent
}

// Legacy interface for backward compatibility
export interface MinistryLeader extends LeaderProfile {
  // Additional properties for backward compatibility
  title: string
  imageAlt: string
  rank?: string
  birthYear?: string
  birthPlace?: string
  education?: string[]
  achievements?: string[]
  decorations?: string[]
}

/**
 * Firestore-compatible leader data structure
 * Ready for direct Firestore import/export
 */
export interface FirestoreLeaderDocument {
  id: string
  name: string
  image: string
  currentTitles: string[]
  personalInfo: {
    fullName: string
    birthDate: string
    partyJoinDate: string
    hometown: string
    positions: string[]
    politicalTheoryLevel: string
    professionalLevel: string
  }
  careerTimeline: Array<{
    year: string
    title: string
    description: string
  }>
  // Extended fields
  branch?: string
  unit?: string
  serviceNumber?: string
  specialization?: string[]
  awards?: string[]
  training?: string[]
  foreignLanguages?: string[]
  publications?: string[]
  
  // Firestore metadata
  createdAt?: string
  updatedAt?: string
  isActive?: boolean
}

/**
 * Type guard to check if data is Firestore compatible
 */
export function isFirestoreLeaderDocument(data: any): data is FirestoreLeaderDocument {
  return data && 
    typeof data.id === 'string' &&
    typeof data.name === 'string' &&
    typeof data.image === 'string' &&
    Array.isArray(data.currentTitles) &&
    data.personalInfo &&
    typeof data.personalInfo.fullName === 'string' &&
    Array.isArray(data.careerTimeline)
}

/**
 * Convert Firestore document to LeaderProfile
 * Migration-ready for future Firestore integration
 */
export function firestoreToLeaderProfile(doc: FirestoreLeaderDocument): LeaderProfile {
  return {
    id: doc.id,
    name: doc.name,
    image: doc.image,
    currentTitles: doc.currentTitles,
    personalInfo: doc.personalInfo,
    careerTimeline: doc.careerTimeline
  }
}

/**
 * Convert LeaderProfile to Firestore document
 * Export-ready for Firestore migration
 */
export function leaderProfileToFirestore(leader: LeaderProfile): FirestoreLeaderDocument {
  return {
    id: leader.id,
    name: leader.name,
    image: leader.image,
    currentTitles: leader.currentTitles,
    personalInfo: leader.personalInfo,
    careerTimeline: leader.careerTimeline,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  }
}

/**
 * Generic Leader List Component
 * Future-proof for any leader type extending LeaderProfile
 */
export function createGenericLeaderList<T extends LeaderProfile>() {
  const GenericLeaderList = memo(({
    leaders,
    onLeaderClick,
    className = ''
  }: LeaderListProps<T>) => {
    // Internal state for dialog management - encapsulated within component
    const [selectedLeader, setSelectedLeader] = useState<T | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // Event handlers with clean separation of concerns
    const handleLeaderClick = (leader: T) => {
      setSelectedLeader(leader)
      setIsDialogOpen(true)
      onLeaderClick?.(leader)
    }

    const handleCloseDialog = () => {
      setIsDialogOpen(false)
      // Small delay before clearing selected leader for smooth transition
      setTimeout(() => setSelectedLeader(null), 300)
    }

    return (
      <>
        <div className={`ministry-leaders-list ${className}`}>
          {leaders.map((leader) => (
            <div 
              key={leader.id} 
              className="leader-card leader-card--clickable"
              onClick={() => handleLeaderClick(leader)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleLeaderClick(leader)
                }
              }}
              aria-label={`Xem hồ sơ của ${leader.name}`}
            >
              <div className="leader-image-container">
                <img 
                  src={leader.image}
                  alt={`Ảnh chân dung ${leader.name}`}
                  className="leader-image"
                  onError={(e) => {
                    const target = e.currentTarget;
                    const fallback = target.nextElementSibling as HTMLElement;
                    target.style.display = 'none';
                    if (fallback) {
                      fallback.style.display = 'flex';
                    }
                  }}
                />
                <div className="leader-image-fallback">
                  <span className="leader-initial">
                    {leader.name.split(' ').map(word => word[0]).join('').toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="leader-info">
                <div className="leader-title">{leader.currentTitles[0]}</div>
                <div className="leader-name">{leader.rank && <span>{leader.rank} </span>}{leader.name}</div>
              </div>
            </div>
          ))}
        </div>

        <LeaderProfileDialog
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          leader={selectedLeader}
        />
      </>
    )
  })

  return GenericLeaderList
}


// Create typed leader list components
export const NavyLeadersList = createGenericLeaderList<NavyLeader>()
export const Division83LeadersList = createGenericLeaderList<Division83Commander>()
export const CustomLeadersList = createGenericLeaderList<ExtendedLeaderProfile>()

// Export the generic component for direct usage
export const GenericLeaderList = createGenericLeaderList<ExtendedLeaderProfile>()

export interface MinistryLeadersListProps {
  leaders: MinistryLeader[]
  onDialogStateChange?: (isOpen: boolean) => void
}

/**
 * MinistryLeadersList Component
 * 
 * PURPOSE: Displays Ministry of Defense leadership information with interactive profile viewing
 * 
 * WHEN TO USE:
 * - Show current Ministry of Defense leadership
 * - Display organizational hierarchy
 * - Present leadership information with images
 * - Enable detailed leader profile viewing
 * 
 * PROPS:
 * - leaders: Array of leader objects with institutional biography data
 * 
 * ARCHITECTURE:
 * - Manages internal dialog state (selectedLeader, isDialogOpen)
 * - Handles user interactions (click, keyboard navigation)
 * - Delegates profile display to LeaderProfileDialog component
 * - Maintains clean separation between list logic and dialog presentation
 * - Optimized with memo to prevent unnecessary re-renders
 * 
 * USAGE:
 * <MinistryLeadersList 
 *   leaders={ministryLeadersData}
 * />
 */
const MinistryLeadersListComponent: React.FC<MinistryLeadersListProps> = ({ leaders, onDialogStateChange }) => {
  // === STATE MANAGEMENT ===
  // Internal state for dialog management - encapsulated within component
  const [selectedLeader, setSelectedLeader] = useState<MinistryLeader | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // === EVENT HANDLERS ===
  // Clean separation of concerns - dedicated handlers for each interaction
  const handleLeaderClick = (leader: MinistryLeader) => {
    setSelectedLeader(leader)
    setIsDialogOpen(true)
    onDialogStateChange?.(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    onDialogStateChange?.(false)
    // Small delay before clearing selected leader for smooth transition
    setTimeout(() => setSelectedLeader(null), 300)
  }

  // === RENDER LOGIC ===
  // Component renders list and delegates dialog rendering to child component
  return (
    <>
      {/* Leader List - Main component responsibility */}
      <div className="ministry-leaders-list">
        {leaders.map((leader) => (
          <div 
            key={leader.id} 
            className="leader-card leader-card--clickable"
            onClick={() => handleLeaderClick(leader)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleLeaderClick(leader)
              }
            }}
            aria-label={`Xem hồ sơ của ${leader.name}`}
          >
            <div className="leader-image-container">
              <img 
                src={leader.image}
                alt={leader.imageAlt}
                className="leader-image"
                onError={(e) => {
                  const target = e.currentTarget;
                  const fallback = target.nextElementSibling as HTMLElement;
                  target.style.display = 'none';
                  if (fallback) {
                    fallback.style.display = 'flex';
                  }
                }}
              />
              <div className="leader-image-fallback">
                <span className="leader-initial">
                  {leader.name.split(' ').map(word => word[0]).join('').toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="leader-info">
              <div className="leader-title">{leader.title}</div>
              <div className="leader-name">{leader.name}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Dialog - Delegated to dedicated component */}
      <LeaderProfileDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        leader={selectedLeader}
      />
    </>
  )
}

// Performance: Memoize component to prevent unnecessary re-renders
export const MinistryLeadersList = memo(MinistryLeadersListComponent)
