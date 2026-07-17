package configs

type Layer4AttackPayload struct {
	ID       int    `json:"id"`
	Method   string `json:"method"`
	Port     int    `json:"port,omitempty"`
	Target   string `json:"target"`
	Duration int    `json:"duration"`
	PPSLimit int    `json:"ppsLimit,omitempty"`
	SlotKey  string `json:"slotKey,omitempty"`
	ServerID int    `json:"serverId,omitempty"`
}

type Layer7AttackPayload struct {
	ID            int    `json:"id"`
	Method        string `json:"method"`
	Target        string `json:"target"`
	Duration      int    `json:"duration"`
	RateLimit     int    `json:"rateLimit,omitempty"`
	RequestMethod string `json:"requestMethod,omitempty"`
	PostData      string `json:"postData,omitempty"`
	SlotKey       string `json:"slotKey,omitempty"`
	ServerID      int    `json:"serverId,omitempty"`
}
