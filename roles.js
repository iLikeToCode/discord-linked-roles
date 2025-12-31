
export const roleMap = {
	// running register.js will auto register this, then the web server will match when a user authenticates
	// if user has any of the roles in this array, they are given the positive metadata
	// they can then clame the role in the linked roles section
	// discord enforces a max of 5 entries here
	"staff_team":    ["1404896442296041543"],
	"high_rank":     ["1418037523623706724"],
	"directive":     ["1452703259541110784"],
	"foundership":   ["1404880068248998012"],
	"stexa":         ["1455646569620705483"]
}

export const rolesToAddViewPerm = {
	// the key here means nothing, just helps the developer, the value should be the role you added the link requirement to
	"steam": "1455710499357327430",
	"hr": "1455710496589090878",
	"di": "1455710493942611969",
	"f":  "1455710472019116073",
	"stexa": "1455710346600906833"
}

