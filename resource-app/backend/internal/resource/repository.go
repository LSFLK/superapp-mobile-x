package resource

import (
	"errors"

	"gorm.io/gorm"
)

var ErrResourceNameDuplicate = errors.New("resource name already exists")

type Repository interface {
	GetResources() ([]Resource, error)
	AddResource(resource *Resource) error
	UpdateResource(resource *Resource) error
	DeleteResource(id string) error
	GetResourceByID(id string) (*Resource, error)
}

type GormRepository struct {
	db *gorm.DB
}

func NewGormRepository(db *gorm.DB) *GormRepository {
	return &GormRepository{db: db}
}

func (r *GormRepository) GetResources() ([]Resource, error) {
	var resources []Resource
	result := r.db.Find(&resources)
	return resources, result.Error
}

func (r *GormRepository) AddResource(resource *Resource) error {
	if err := r.db.Create(resource).Error; err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			return ErrResourceNameDuplicate
		}
		return err
	}

	return nil
}

func (r *GormRepository) UpdateResource(resource *Resource) error {
	result := r.db.Model(&Resource{}).
		Where("id = ?", resource.ID).
		Updates(resource)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrDuplicatedKey) {
			return ErrResourceNameDuplicate
		}
		return result.Error
	}
	return nil
}

func (r *GormRepository) DeleteResource(id string) error {
	return r.db.Delete(&Resource{}, "id = ?", id).Error
}

func (r *GormRepository) GetResourceByID(id string) (*Resource, error) {
	var resource Resource
	result := r.db.First(&resource, "id = ?", id)
	return &resource, result.Error
}
