#-*-: utf-8
# https://segmentfault.com/a/1190000015144126#articleHeader1
import requests
import json
import base64

token1 = '101eac4f31ae1b|b9052962d'
token2 = 'b1318c1f704c26716003x'

def getToken():
    return token1.replace('|',token2)

class GitHubApi(object):
    def __init__(self,user,repos,token):
        self.url = 'https://api.github.com'
        self.user = user
        self.repos = repos
        self.token = token
        self.headers = {'Authorization': 'token %s' % self.token,'Content-type': 'application/json'}
        self.tags = 'tags'
        self.session = 'session'
        self.bookmarks = 'bookmarks'

    """
    传输方法：PUT
    访问路径：https://api.github.com/repos/用户名/仓库名/contents/文件路径
    JSON格式：
        {
        "message": "commit from INSOMNIA",
        "content": "$sha="
        }
    """
    def create(self,pathFile):
        data = {
            "message": "commit init",
            "content": "IyAyMDE5IG5ldyBmaWxlCg=="
        }

        print('%s/repos/%s/%s/contents/%s' % (self.url,self.user,self.repos,pathFile))
        result = requests.put('%s/repos/%s/%s/contents/%s' % (self.url,self.user,self.repos,pathFile),headers=self.headers,data=json.dumps(data))
        return result

    def stringToBase64(self,instring):
        return str(base64.b64encode(instring.encode('utf-8')),'utf-8')

    """
    传输方法：PUT
    访问路径：https://api.github.com/repos/用户名/仓库名/contents/文件路径
    JSON格式：
        {
        "message": "update from INSOMNIA",
        "content": "$sha",
        "sha": "$sha"
        }
    """    
    def update(self,pathFile,message,content):
        # 获取文件sha
        r = self.get(pathFile)
        tmp = json.loads(r.text)
        # print('sha',tmp['sha'])

        data = {
            "message": message,
            "content": self.stringToBase64(content),
            "sha": tmp['sha']
        }
        result = requests.put('%s/repos/%s/%s/contents/%s' % (self.url,self.user,self.repos,pathFile),headers=self.headers,data=json.dumps(data))
        return result

    """
    传输方法：DELETE
    访问路径：https://api.github.com/repos/用户名/仓库名/contents/文件路径
    JSON格式：
    {
    "message": "delete a file",
    "sha": "$sha"
    }
    """
    def delete(self,pathFile,message):
        # 获取文件sha
        r = self.get(pathFile)
        tmp = json.loads(r.text)

        data = {
            "message": message,
            "sha": tmp['sha']
        }
        result = requests.delete('%s/repos/%s/%s/contents/%s' % (self.url,self.user,self.repos,pathFile),headers=self.headers,data=json.dumps(data))
        return result

    # curl https://api.github.com/repos/lflxp/tags/contents/tags\?access_token\=$token
    def get(self,pathFile):
        result = requests.get('%s/repos/%s/%s/contents/%s' % (self.url,self.user,self.repos,pathFile),headers=self.headers)
        return result

if __name__ == "__main__":
    token = getToken()
    user = 'lflxp'
    repos = 'tags'

    instance = GitHubApi(user,repos,token)

    createFileList = ['tags/1','tags/2','tags/3']

    # for x in createFileList:
    #     x = instance.create(x)
    #     print(x.text)

    # newContent = '# newone'
    # for x in createFileList:
    #     t = instance.update(x,"newone",newContent)
    #     print(t.text)

    for x in createFileList:
        t = instance.delete(x,'over')
        print(t.text)

    r = instance.get('tags')
    print(r.text)
