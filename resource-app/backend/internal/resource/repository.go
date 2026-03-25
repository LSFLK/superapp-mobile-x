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
	// Check for duplicate name (case-insensitive)
	var count int64
	if err := r.db.Model(&Resource{}).
		Where("LOWER(name) = LOWER(?)", resource.Name).
		Count(&count).Error; err != nil {
		return err
	}

	if count > 0 {
		return ErrResourceNameDuplicate
	}

	return r.db.Create(resource).Error
}

func (r *GormRepository) UpdateResource(resource *Resource) error {
	// Check for duplicate name (case-insensitive) excluding self
	var count int64
	if err := r.db.Model(&Resource{}).
		Where("id != ? AND LOWER(name) = LOWER(?)", resource.ID, resource.Name).
		Count(&count).Error; err != nil {
		return err
	}

	if count > 0 {
		return ErrResourceNameDuplicate
	}

	return r.db.Model(&Resource{}).
		Where("id = ?", resource.ID).
		Updates(resource).Error
}

func (r *GormRepository) DeleteResource(id string) error {
	return r.db.Delete(&Resource{}, "id = ?", id).Error
}

func (r *GormRepository) GetResourceByID(id string) (*Resource, error) {
	var resource Resource
	result := r.db.First(&resource, "id = ?", id)
	return &resource, result.Error
}
