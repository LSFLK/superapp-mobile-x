package booking

func canTransition(from, to BookingStatus) bool {
	switch from {
	case StatusPending:
		return to == StatusConfirmed || to == StatusRejected || to == StatusProposed || to == StatusCancelled
	case StatusProposed:
		return to == StatusConfirmed || to == StatusRejected || to == StatusCancelled
	case StatusConfirmed:
		return to == StatusCheckedIn || to == StatusCancelled
	case StatusCheckedIn:
		return to == StatusCompleted
	default:
		return false
	}
}
