class UserDTO {
  constructor(user) {
    this.id = user?._id ? user._id.toString() : null;  
    this.first_name = user?.first_name || ''; 
    this.last_name = user?.last_name || '';
    this.email = user?.email || '';
    this.role = user?.role || 'user'; 
  }
}

export default UserDTO;
