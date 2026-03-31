package group

type Service struct {
	repo Repository
}

func NewService(repo Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) CreateGroup(createGroup *CreateGroupPayload) (*CreateGroupResult, error) {
	return s.repo.CreateGroup(createGroup)
}

func (s *Service) GetGroups() ([]Group, error) {
	return s.repo.GetGroups()
}

func (s *Service) UpdateGroup(group *Group) error {
	return s.repo.UpdateGroup(group)
}

func (s *Service) DeleteGroup(id string) error {
	return s.repo.DeleteGroup(id)
}

func (s *Service) AddUsersToGroup(groupID string, userIDs []string) (*AddUsersToGroupResult, error) {
	return s.repo.AddUsersToGroup(groupID, userIDs)
}

func (s *Service) RemoveUserFromGroup(groupID, userID string) (*RemoveUserFromGroupResult, error) {
	return s.repo.RemoveUserFromGroup(groupID, userID)
}

func (s *Service) GetGroupMembers(groupID string) ([]GroupMemberResult, error) {
	return s.repo.GetGroupMembers(groupID)
}
