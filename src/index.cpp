#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <stdio.h>
#include "http-phraser.cpp"
using namespace std;

const int PORT = 8080;

/*

Required Methods:
    socket
    bind
    listen
    accept

*/

int main(int argc, char *argv[])
{
    struct sockaddr_in address;
    int socketFD = socket(AF_INET, SOCK_STREAM, 0);
    printf("socket created (fd: %d)\n", socketFD);

    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(PORT);    

    while (bind(
               socketFD,
               (struct sockaddr *)&address,
               sizeof(address)) > 0)
    {
    };
    printf("bound socket\n");
    printf("listening (status: %d)\n", listen(socketFD, 10));
    int incomeingSocket = 0;
    int incomeingMsgLen = 0;
    struct sockaddr_in incomeingAddress;

    while (true)
    {
        if ((
                incomeingSocket = accept(
                    socketFD,
                    (struct sockaddr *)&incomeingAddress,
                    (socklen_t *)&incomeingMsgLen)) > 0)
        {
            httpRequest req = httpRequest(incomeingSocket);
            httpResponse res = httpResponse(incomeingSocket);

            res.writeHead(200, (char *)"OK");
            res.addHeader(httpHeader((char *)"Host", (char *)"localhost"));
            res.write((char *)"Hello World");

            res.end();

            incomeingSocket = -1;
        }
    }

    return 0;
}
