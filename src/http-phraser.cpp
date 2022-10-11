#include <stdlib.h>
#include <sys/ioctl.h>
#include <stdio.h>
#include <string.h>
#include <arpa/inet.h>
#include <string>
#include "util/math.cpp"
using namespace std;
using namespace mathUtil;

#define OPTIONS "OPTIONS"
#define GET "GET"
#define HEAD "HEAD"
#define PUT "PUT"
#define POST "POST"
#define DELETE "DELETE"
#define PATCH "PATCH"

class httpHeader
{
private:
public:
    char name[64];
    char value[64];

    httpHeader(char name[64], char value[64]);
    httpHeader(char rawData[]);
    ~httpHeader();
};

httpHeader::httpHeader(char name[64], char value[64])
{
    strcpy(this->name, name);
    strcpy(this->value, value);
};

httpHeader::httpHeader(char rawData[])
{

    int i = 0;
    while (rawData[i] != ':')
    {
        i++;
    }

    memcpy(this->name, rawData, i);
    memcpy(this->value, rawData + i + 1, *rawData - i - 1);
};

httpHeader::~httpHeader()
{
}

class httpRequest
{
private:
    void phraseStartLine(char rawData[]);

public:
    httpHeader *headers[50];
    char path[2048];
    char method[32];
    char version[8];
    int socketFd;

    httpRequest(int fd);
    ~httpRequest();
};

void httpRequest::phraseStartLine(char rawData[])
{
    int crntOffset = 0;
    int toAddToOffset = 0;
    int dataToRead = strlen(rawData);

    memset(this->version, 0, sizeof(this->version));
    memset(this->method, 0, sizeof(this->method));
    memset(this->path, 0, sizeof(this->path));

    int n = 0;
    int x = 0;

    for (int i = 0; i < strlen(rawData); i++)
    {
        if (rawData[i] == ' ')
        {
            n++;
            x = 0;
        }
        else
        {
            switch (n)
            {
            case 0:
                if (x > 32) { throw "Bad Request Data"; }
                this->method[x] = rawData[i];
                break;
            case 1:
                if (x > 2048) { throw "Bad Request Data"; }
                this->path[x] = rawData[i];
                break;
            case 2:
                if (x > 8) { throw "Bad Request Data"; }
                this->version[x] = rawData[i];
                break;
            }
            x++;
        }
    }
};

httpRequest::httpRequest(int fd)
{
    int size = 0;
    this->socketFd = fd;
    ioctl(fd, FIONREAD, &size);

    if (size > 102400)
        this->~httpRequest();

    char rawData[] = {};
    read(this->socketFd, rawData, size);

    char prevChar = ' ';
    char chunks[50][2048] = {};
    int n = 0;
    int x = 0;
    int i = 0;

    while (i < size)
    {
        if ((prevChar == '\n') && (rawData[i] == '\n'))
            break;
        if (rawData[i] == '\n')
        {
            n++;
            x = 0;
        }
        else
        {
            chunks[n][x] = rawData[i];
            x++;
        }
        prevChar = rawData[i];
        i++;
    }

    this->phraseStartLine(chunks[0]);
};

httpRequest::~httpRequest()
{
}

class httpResponse
{
private:
    void writeToSock(char data[]);
    bool mainHeadersSent;
    bool headersSent;
    int socketFd;

public:
    void writeHead(int statusCode, char message[32], httpHeader headers[]);
    void writeHead(int statusCode, char message[32]);
    void end();
    void addHeader(httpHeader header);
    void addHeaders(httpHeader header[]);
    void write(char data[]);
    void addTrailers(httpHeader trailers[]);
    void addTrailer(httpHeader trailer);
    bool writable;

    httpResponse(int fd);
    ~httpResponse();
};

httpResponse::httpResponse(int fd)
{
    this->socketFd = fd;
    this->mainHeadersSent = false;
    this->headersSent = false;
}

httpResponse::~httpResponse()
{
    close(this->socketFd);
}

void httpResponse::writeHead(int statusCode, char message[32], httpHeader headers[])
{
    if (this->mainHeadersSent)
        return;
    if (statusCode > 999 | statusCode < 0)
        return;
    this->mainHeadersSent = true;

    char status[45] = "";
    sprintf(status, "HTTP/1.1 %d %s\n", statusCode, message);

    this->writeToSock(status);
    this->addHeaders(headers);
};

void httpResponse::writeHead(int statusCode, char message[])
{
    if (this->mainHeadersSent)
        return;
    if (statusCode > 999 | statusCode < 100)
        return;
    this->mainHeadersSent = true;

    string status = to_string(statusCode);
    char *headString = (char *)malloc(11 + sizeof(&message) + sizeof(&status));
    sprintf(headString, "HTTP/1.1 %s %s\n", status.c_str(), message);
    this->writeToSock(headString);
};

void httpResponse::addHeader(httpHeader header)
{
    if (this->headersSent)
        return;
    char headerText[129] = "";
    sprintf(headerText, "%s: %s\n", header.name, header.value);
    this->writeToSock(headerText);
};

void httpResponse::addHeaders(httpHeader headers[])
{
    for (size_t i = 0; i < sizeof(&headers) / sizeof(httpHeader); i++)
    {
        this->addHeader(headers[i]);
    }
};

void httpResponse::writeToSock(char data[])
{
    send(this->socketFd, data, strlen(data), 0);
};

void httpResponse::write(char data[])
{
    if (!this->headersSent)
    {
        this->writeToSock((char *)"\n");
        this->headersSent = true;
    }
    this->writeToSock(data);
};

void httpResponse::end()
{
    this->~httpResponse();
};
