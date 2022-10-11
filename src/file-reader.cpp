#include <filesystem>
#include <stdio.h>
#include <vector>
namespace fs = std::filesystem;
using namespace std;

struct fileInfo
{
    char path[1024];
    char fullPath[1024];
    int flags;

    int fileSize;
    // vector<int, int> lastWriteTime;

    bool fifo;
    bool other;
    bool socket;
    bool blockFile;
    bool directory;
    bool regularFile;
    bool symbolicLink;
    bool characterFile;
};

class webFileSystem
{
private:
    char *path;

public:
    int dirChainLength = 1;
    fileInfo directorys[50] = {};
    fileInfo files[200] = {};

    fileInfo getFile(char path[1024]);

    webFileSystem(char path[]);
    ~webFileSystem();
};

fileInfo webFileSystem::getFile(char path[1024])
{
    char *readPath = (char *)malloc(sizeof(this->path) + sizeof(&path));
    // sprintf(readPath, "%s/%s", this->path, path);
    for (size_t i = 0; i < 200; i++)
    {
        printf("%d\n%d\n%i\n", strlen(path), strlen(this->files[i].path), this->files[i].path == path);
        if (true)
        if (this->files[i].path == path)
        {
            return this->files[i];
        }
    }
    throw logic_error("File Not Found");
}

webFileSystem::webFileSystem(char path[])
{
    fs::recursive_directory_iterator fileInfos(path);

    this->path = path;

    int fi = 0;
    int di = 0;

    for (const auto &entry : fileInfos)
    {
        fileInfo crntFileInfo;

        // TODO
        //  crntFileInfo.lastWriteTimes

        char *entPath = (char *)entry.path().c_str();
        memset(crntFileInfo.path, 0, sizeof(crntFileInfo.path));
        memcpy(crntFileInfo.path, entPath + strlen(path), strlen(entPath) - strlen(path));
        memset(crntFileInfo.fullPath, 0, sizeof(crntFileInfo.fullPath));
        strcpy(crntFileInfo.fullPath, entPath);
        if (entry.is_regular_file())
        {
            crntFileInfo.fileSize = entry.file_size();
        }

        crntFileInfo.fifo = entry.is_fifo();
        crntFileInfo.other = entry.is_other();
        crntFileInfo.socket = entry.is_socket();
        crntFileInfo.directory = entry.is_directory();
        crntFileInfo.blockFile = entry.is_block_file();
        crntFileInfo.symbolicLink = entry.is_symlink();
        crntFileInfo.regularFile = entry.is_regular_file();
        crntFileInfo.characterFile = entry.is_character_file();

        if (entry.is_regular_file())
        {
            memcpy(&(this->files[fi]), &crntFileInfo, sizeof(crntFileInfo));
            fi++;
        }
        else
        {
            memcpy(&(this->directorys[di]), &crntFileInfo, sizeof(crntFileInfo));
            di++;
        }
    };
}

webFileSystem::~webFileSystem()
{
}

int main()
{
    webFileSystem webFiles((char *)"/Users/michael/Desktop/code/Progects/Bejing");

    printf("%s", webFiles.getFile((char *)"/test.js").fullPath);
};
