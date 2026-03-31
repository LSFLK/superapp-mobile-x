package group

import "time"

type Group struct {
	ID          string    `json:"id" gorm:"type:varchar(36);primaryKey"`
	Name        string    `json:"name" binding:"required" gorm:"type:varchar(100);not null"`
	Description string    `json:"description" gorm:"type:text"`
	CreatedAt   time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt   time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
}

type UserGroup struct {
	ID        string    `json:"id" gorm:"type:varchar(36);primaryKey"`
	UserID    string    `json:"userId" gorm:"column:user_id;type:varchar(36);not null;index"`
	GroupID   string    `json:"groupId" gorm:"column:group_id;type:varchar(36);not null;index"`
	CreatedAt time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
}

type CreateGroupPayload struct {
	Name        string   `json:"name" binding:"required"`
	Description string   `json:"description"`
	UserIDs     []string `json:"userIds,omitempty" binding:"omitempty,dive,required,uuid"`
}

type CreateGroupResult struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	UserIDs     []string  `json:"userIds"`
}

type UpdateGroupPayload struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
}

type AddedUserResult struct {
	UserID string `json:"user_id"`
}

type AddUsersToGroupRequest struct {
	UserIDs []string `json:"user_ids" binding:"required,min=1,dive,required"`
}

type AddUsersToGroupResult struct {
	GroupID    string            `json:"group_id"`
	AddedUsers []AddedUserResult `json:"added_users"`
}

type RemoveUserFromGroupResult struct {
	GroupID string `json:"group_id"`
	UserID  string `json:"user_id"`
}

type GroupMemberResult struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}