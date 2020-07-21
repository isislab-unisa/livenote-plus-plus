# Livenote++

## Getting started

Start using Node

```bash
# Install dependencies for server
npm install

# Start turn
systemctl start coturn

# Run the server
node server
```

Start using Docker

```bash
# Building the image
docker build --tag livenote++ .

# Run the image in a container
docker run -d -p 433:433 livenote++
```

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE) file for details