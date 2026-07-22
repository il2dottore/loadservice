Viết cho tôi hạ tầng terraform sau:
C:.
│   .gitignore
│   main.tf
│
└───modules
    ├───ec2
    │       main.tf
    │       outputs.tf
    │       variables.tf
    │
    ├───ecr
    │       main.tf
    │       outputs.tf
    │       variables.tf
    │
    └───vpc
            main.tf
            outputs.tf
            variables.tf

1. VPC (192.168.1.0/24)
- Private subnet: 192.168.1.0/26
- Public subnet: 192.168.1.64/26
- Internet Gateway
2. EC2
- 1 bastion host
- 1 backend server (Chạy 3 services NestJS và 2 service Go attack-node-router, api-gateway)
- 1 RDS PostgreSQL
- 1 web server
- 1 NAT instance
3. ECR
- Tạo repository ECR:
  + loadservice-common
  + loadservice-attack
  + loadservice-payment
  + loadservice-attack-node-router
  + loadservice-api-gateway
- Chỉ giữ 3 image mới nhất
4. Cấu hình network
- Ai cũng vào được Bastion từ Internet
- Backend server chỉ chấp nhận request từ api-gateway
