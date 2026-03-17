package resource

import (
	"time"

	"gorm.io/gorm"
)

type Repository interface {
	GetResources() ([]Resource, error)
	AddResource(resource *Resource) error
	UpdateResource(resource *Resource) error
	DeleteResource(id string) error
	GetResourceByID(id string) (*Resource, error)
	GetUtilizationStats() ([]ResourceUsageStats, error)
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
	return r.db.Create(resource).Error
}

func (r *GormRepository) UpdateResource(resource *Resource) error {
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

func (r *GormRepository) GetUtilizationStats() ([]ResourceUsageStats, error) {
	resources, err := r.GetResources()
	if err != nil {
		return nil, err
	}

	var stats []ResourceUsageStats

	for _, res := range resources {
		var bookings []struct {
			Start time.Time
			End   time.Time
		}

		if err := r.db.Table("bookings").
			Select("start, end").
			Where("resource_id = ? AND status = ?", res.ID, "confirmed").
			Find(&bookings).Error; err != nil {
			return nil, err
		}

		totalMs := int64(0)
		for _, booking := range bookings {
			totalMs += booking.End.Sub(booking.Start).Milliseconds()
		}

		totalHours := int(totalMs / (1000 * 60 * 60))
		utilizationRate := 0
		if totalHours > 0 {
			utilizationRate = int((float64(totalHours) / 160.0) * 100.0)
			if utilizationRate > 100 {
				utilizationRate = 100
			}
		}

		stats = append(stats, ResourceUsageStats{
			ResourceID:      res.ID,
			ResourceName:    res.Name,
			ResourceType:    res.Type,
			BookingCount:    len(bookings),
			TotalHours:      totalHours,
			UtilizationRate: utilizationRate,
		})
	}

	return stats, nil
}