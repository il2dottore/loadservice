Vậy giờ làm vậy thì sao:
- Bỏ cách lấy server từ [servers.json](c:/Users/il2dottore/Documents/Projects/darkservice/attack-node-router/servers.json)
- Attack server sẽ gửi thêm userId cho [attack-node-router](c:/Users/il2dottore/Documents/Projects/darkservice/attack-node-router/), router sẽ gửi attack đến /users/:id/allowed-servers
- Endpoint này sẽ xuất ra servers cho phép người dùng có plan hiện tại có thể truy cập:
- Nếu người dùng có plan là FREE thì truy cập được vào tất cả các server mà network có chữ free (không phân biệt chữ hoa chữ thường)
- 