import cv2
import numpy as np
import sys
import copy
from scipy.signal import lfilter
from skimage.filters import threshold_niblack,threshold_sauvola
from flask import Flask, request, redirect, url_for, render_template, send_file
from gevent import pywsgi
import base64
import string
import random
import os
import json

app = Flask(__name__)

functionName = ''
out_path = ''
name = ''

class Contrast(object):             # 用于增强对比度，使用局部自适应直方图均衡（一定程度上可以减轻噪声对直方图均衡带来的影响，但是最好还是在使用之前去除噪声）
    def __init__(self):
        super(Contrast, self).__init__()
    def process(self,img,clipLimit):          # clipLimit越大，对比度越强
        imgcpy=copy.deepcopy(img)
        if len(imgcpy.shape)==2:        # 灰度图像
            clahe=cv2.createCLAHE(clipLimit=clipLimit,tileGridSize=(8,8))
            dst=clahe.apply(imgcpy)
            return dst
        elif len(imgcpy.shape)==3:             # 彩色图像
            ycrcb = cv2.cvtColor(imgcpy, cv2.COLOR_BGR2YCR_CB)
            channels = cv2.split(ycrcb)
            clahe = cv2.createCLAHE(clipLimit=clipLimit, tileGridSize=(8, 8))
            channels[0]=clahe.apply(channels[0])
            cv2.merge(channels, ycrcb)
            cv2.cvtColor(ycrcb, cv2.COLOR_YCR_CB2BGR, imgcpy)
            return imgcpy
        else:
            print("不是彩色图像也不是灰度图像，请重新上传")
            return

class morph(object):
    def __int__(self):
        super(morph,self).__init__()
    def erode(self,img,winSize):
        imgcpy=copy.deepcopy(img)
        result = cv2.erode(imgcpy, kernel=np.ones((winSize, winSize), np.uint8), iterations=1)
        return result
    def expand(self,img,winSize):
        imgcpy=copy.deepcopy(img)
        result=cv2.dilate(imgcpy,kernel=np.ones((winSize, winSize), np.uint8), iterations=1)
        return result



class Filter(object):               # 用来去除噪声或模糊图像
    def __init__(self):
        super(Filter, self).__init__()
    def bilateral(self,img,nei=25,sigma1=75,sigma2=75):      #  nei邻域直径，sigma1空间高斯函数标准差，sigma2灰度值相似性高斯函数标准差
        imgcpy=copy.deepcopy(img)
        return cv2.bilateralFilter(imgcpy,nei,sigma1,sigma2)
    def meanfilter(self,img,winSize):                 # winSize越大图像越模糊
        imgcpy=copy.deepcopy(img)
        return cv2.blur(imgcpy,(int(winSize),int(winSize)))
    def laplace(self,img,ksize=3):
        return cv2.Laplacian(img,cv2.CV_64F,ksize=ksize)
    def sharpen(self,img,a=2,b=1,winSize=5,sigma=1):
        imgcpy=copy.deepcopy(img)
        blur=cv2.GaussianBlur(imgcpy,(winSize,winSize),sigmaX=sigma)
        # sharp=imgcpy+w*(imgcpy-blur)
        sharp=cv2.addWeighted(img,a,blur,-b,0)
        return sharp

class Binary(object):           # 用来对图像进行二值化（localadp效果略差于adaptiveThresh）
    def __init__(self):
        super(Binary, self).__init__()
    def localadp(self,img,block_size=11,C=2):       # 当blockSize越大，参与计算阈值的区域也越大，细节轮廓就变得越少，整体轮廓越粗越明显;当C越大，整体图像白色像素就越多
        if len(img.shape)!=3 and len(img.shape)!=2:
            print("不是彩色图像也不是灰度图像，请重新上传")
            return
        if len(img.shape)==3:
            img = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
        bil = Filter().bilateral(img, 11, 75, 75)  # 双边滤波，保持边界
        contrast = Contrast().process(bil, clipLimit=2)  # 增强对比度
        img=cv2.blur(contrast, (5, 5))
        dst=cv2.adaptiveThreshold(img,maxValue=255,adaptiveMethod=cv2.ADAPTIVE_THRESH_GAUSSIAN_C,thresholdType=cv2.THRESH_BINARY,blockSize=block_size,C=C)
        return dst

    def adaptiveThresh(self,img,winSize=11,ratio=0.15):         # winSize越小越细，ratio越大越模糊（0.15是个经验值）
        imgcpy=copy.deepcopy(img)
        mean=cv2.boxFilter(imgcpy,cv2.CV_32FC1,(int(winSize),int(winSize)))        # 均值平滑
        out=imgcpy-(1.0-ratio)*mean        # 原图像与平滑结果做差
        out[out>=0]=255
        out[out<0]=0
        out=out.astype(np.uint8)
        return out

    def movingAverage(self,img,n=20,k=0.5):
        imgcpy=copy.deepcopy(img)
        shape=imgcpy.shape
        imgcpy[1:-1:2,:]=np.fliplr(imgcpy[1:-1:2,:])
        imgcpy=imgcpy.flatten()
        maf=np.ones(n)/n
        res_filter=lfilter(maf,1,imgcpy)
        g=np.array(imgcpy>k*res_filter).astype(int)
        g=g.reshape(shape)
        g[1:-1:2,:]=np.fliplr(g[1:-1:2,:])
        g=g*255
        return g.astype(np.uint8)
    def sauvola(self,img,k,windowSize=11):
        imgcpy=copy.deepcopy(img)
        threshold=threshold_sauvola(imgcpy,windowSize,k)
        imgcpy[imgcpy>threshold]=255
        imgcpy[imgcpy<threshold]=0
        return imgcpy
    def niblack(self,img,windowSize=31,k=0.8):
        imgcpy = copy.deepcopy(img)
        threshold=threshold_niblack(img,window_size=windowSize,k=k)
        imgcpy[imgcpy>threshold]=255
        imgcpy[imgcpy<threshold]=0
        return imgcpy

four_point=[]
def get_location(self,event,x,y,flags,param):
    if event==cv2.EVENT_LBUTTONDOWN:
        self.four_point.append([x,y])
        if len(self.four_point)==4:
            self.four_point=np.array(self.four_point)
            self.four_point.reshape(4, 2)
def capture(image):
    orig = copy.deepcopy(image)
    cv2.namedWindow('image',cv2.WINDOW_KEEPRATIO)
    cv2.setMouseCallback('image', get_location)
    cv2.imshow("image", orig)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
    cv2.drawContours(orig, [four_point], -1, (0, 255, 0), 2)
    cv2.namedWindow('Outline', cv2.WINDOW_KEEPRATIO)
    cv2.imshow("Outline", orig)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
    ratio = orig.shape[0] / 500.0
    warped = four_point_transform(orig, four_point.reshape(4, 2) * ratio)
    return warped

def four_point_transform(image, pts):
    # obtain a consistent order of the points and unpack them
    # individually
    rect = order_points(pts)
    (tl, tr, br, bl) = rect
    # compute the width of the new image, which will be the
    # maximum distance between bottom-right and bottom-left
    # x-coordiates or the top-right and top-left x-coordinates
    widthA = np.sqrt(((br[0] - bl[0]) ** 2) + ((br[1] - bl[1]) ** 2))
    widthB = np.sqrt(((tr[0] - tl[0]) ** 2) + ((tr[1] - tl[1]) ** 2))
    maxWidth = max(int(widthA), int(widthB))
    # compute the height of the new image, which will be the
    # maximum distance between the top-right and bottom-right
    # y-coordinates or the top-left and bottom-left y-coordinates
    heightA = np.sqrt(((tr[0] - br[0]) ** 2) + ((tr[1] - br[1]) ** 2))
    heightB = np.sqrt(((tl[0] - bl[0]) ** 2) + ((tl[1] - bl[1]) ** 2))
    maxHeight = max(int(heightA), int(heightB))
    # now that we have the dimensions of the new image, construct
    # the set of destination points to obtain a "birds eye view",
    # (i.e. top-down view) of the image, again specifying points
    # in the top-left, top-right, bottom-right, and bottom-left
    # order
    dst = np.array([
        [0, 0],
        [maxWidth - 1, 0],
        [maxWidth - 1, maxHeight - 1],
        [0, maxHeight - 1]], dtype="float32")
    # compute the perspective transform matrix and then apply it
    M = cv2.getPerspectiveTransform(rect, dst)
    warped = cv2.warpPerspective(image, M, (maxWidth, maxHeight))
    # return the warped image
    return warped

def order_points(pts):
    # initialzie a list of coordinates that will be ordered
    # such that the first entry in the list is the top-left,
    # the second entry is the top-right, the third is the
    # bottom-right, and the fourth is the bottom-left
    rect = np.zeros((4, 2), dtype="float32")
    # the top-left point will have the smallest sum, whereas
    # the bottom-right point will have the largest sum
    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)]
    rect[2] = pts[np.argmax(s)]
    # now, compute the difference between the points, the
    # top-right point will have the smallest difference,
    # whereas the bottom-left will have the largest difference
    diff = np.diff(pts, axis=1)
    rect[1] = pts[np.argmin(diff)]
    rect[3] = pts[np.argmax(diff)]
    # return the ordered coordinates
    return rect

def generate_filename():
    a = random.choices(string.ascii_lowercase, k=20)
    path = ''.join(a) + '.jpg'
    name = ''.join(a)
    return path, name

@app.route('/', methods=['POST'])
def processImg():
    global functionName
    global out_path
    global name
    # corner = getCorner()
    return_dict = {'return_code': '404', "return_info": "xxx"}
    get_Data = request.form.to_dict()
    print('Data:',get_Data)

    # 传入的参数为bytes类型，需要转化成json
    # get_Data=json.loads(get_Data)
    # print(get_Data)

    bool = str(get_Data["bool"])
    # 判断功能
    flag = get_Data["flag"]
    # 获取参数值
    par = round(float(get_Data["par"]),1)
    # 获取区域坐标
    corner1 = int(get_Data["corner1"])
    corner2 = int(get_Data["corner2"])
    corner3 = int(get_Data["corner3"])
    corner4 = int(get_Data["corner4"])
    corner5 = int(get_Data["corner5"])
    corner6 = int(get_Data["corner6"])
    corner7 = int(get_Data["corner7"])
    corner8 = int(get_Data["corner8"])


    if request.method == 'POST':
        if bool == '0':
            uploaded_file = request.files['file']
            if uploaded_file.filename != '':
                if uploaded_file.filename[-3:] in ['jpg','JPG', 'JPEG','PNG','png', 'TIF','tif', 'PSD','psd','BMP', 'bmp']:

                    path_new, name = generate_filename()
                    image_path = os.path.join("images/origin", path_new)
                    print('ImgPath:',image_path)
                    uploaded_file.save(image_path)
                    img = cv2.imread(image_path)
                    print('InitialImg:',np.shape(img))
                    imgAfter = img


                    # 判断是否选取域
                    if corner1 == 0 or corner2 == 0 or corner3 == 0 or corner4 == 0 or corner5 == 0 or corner6 == 0 or corner7 == 0 or corner8 == 0:
                        warped = img

                    else:
                        orig = copy.deepcopy(img)
                        four_point = np.array([[corner1,corner2], [corner3, corner4], [corner5,corner6], [ corner7,corner8]])  # 通过小程序传输
                        print(four_point)
                        warped = four_point_transform(orig, four_point.reshape(4, 2))
                        print('1WarpedImg:', bool,np.shape(warped))

                    # 增强对比度
                    if flag == '1':
                        functionName = 'contrast'
                        contrast = Contrast().process(warped, par)  # 2
                        imgAfter = contrast

                    # 均值滤波，对图像进行模糊处理
                    if flag == '2':
                        functionName = 'meanfilter'
                        blur = Filter().meanfilter(warped, par)  # 25
                        imgAfter = blur

                    # 移动平均法阈值处理
                    if flag == '3':
                        functionName = 'movingAverage'
                        zig = Binary().movingAverage(warped, 10, 0.5)
                        imgAfter = zig

                    # 锐化
                    if flag == '4':
                        functionName = 'sharpen'
                        sharp = Filter().sharpen(warped, par)  # a =2
                        imgAfter = sharp

                    # 另一种自适应阈值处理
                    if flag == '5':
                        functionName = 'adaptiveThresh'
                        binary = Binary().adaptiveThresh(warped, par, ratio=0.15)  # 11
                        imgAfter = binary

                    # sauvola阈值处理
                    if flag == '6':
                        functionName = 'sauvola'
                        sauvola = Binary().sauvola(warped, par, windowSize=11)  # 0.8
                        imgAfter = sauvola

                    if flag == '8':
                        functionName = 'erode'
                        erode = morph().erode(warped, int(par))  # 2
                        imgAfter = erode

                    if flag == '9':
                        functionName = 'expand'
                        expand = morph().expand(warped, int(par))  # 2
                        imgAfter = expand

                    print('ProcessedImg:', np.shape(imgAfter))

                    out_path = "images/generated/" + name + '_' + functionName + "_out.jpg"
                    cv2.imwrite(out_path, imgAfter)
                    # warp_path = "images/generated/" + name + '_' + "warped.jpg"
                    # cv2.imwrite(warp_path, warped)

                    print("Finished")

                    # f1 = open(warp_path, "rb")
                    # res1 = f1.read()
                    # warped = base64.b64encode(res1)

                    f2 = open(out_path, "rb")
                    res2 = f2.read()
                    generated = base64.b64encode(res2)

                    return generated
        else:
            warped = cv2.imread(out_path)
            # 判断是否选取域
            if corner1 == 0 or corner2 == 0 or corner3 == 0 or corner4 == 0 or corner5 == 0 or corner6 == 0 or corner7 == 0 or corner8 == 0:
                warped = warped
            else:
                orig = copy.deepcopy(warped)
                four_point = np.array(
                    [[corner1, corner2], [corner3, corner4], [corner5, corner6], [corner7, corner8]])  # 通过小程序传输
                print(four_point)
                warped = four_point_transform(orig, four_point.reshape(4, 2))

            print('2WarpedImg:', bool,np.shape(warped))


            # 增强对比度
            if flag == '1':
                functionName = 'contrast'
                contrast = Contrast().process(warped, par) # 2
                imgAfter = contrast

            # 均值滤波，对图像进行模糊处理
            if flag == '2':
                functionName = 'meanfilter'
                blur = Filter().meanfilter(warped, par) # 25
                imgAfter = blur

            # 移动平均法阈值处理
            if flag == '3':
                functionName = 'movingAverage'
                zig = Binary().movingAverage(warped, 10, 0.5)
                imgAfter = zig

            # 锐化
            if flag == '4':
                functionName = 'sharpen'
                sharp = Filter().sharpen(warped,par)  # a =2
                imgAfter = sharp

            # 另一种自适应阈值处理
            if flag == '5':
                functionName = 'adaptiveThresh'
                binary = Binary().adaptiveThresh(warped,par,ratio=0.15) # 11
                imgAfter = binary

            # sauvola阈值处理
            if flag == '6':
                functionName = 'sauvola'
                sauvola = Binary().sauvola(warped, par, windowSize=11) # 0.8
                imgAfter = sauvola

            if flag == '8':
                functionName = 'erode'
                erode = morph().erode(warped, int(par))  # 2
                imgAfter = erode

            if flag == '9':
                functionName = 'expand'
                expand = morph().expand(warped, int(par))  # 2
                imgAfter = expand

            print('ProcessedImg:',np.shape(imgAfter))

            out_path = "images/generated/" + name + '_' + functionName + "_out.jpg"
            cv2.imwrite(out_path, imgAfter)
            # warp_path = "images/generated/" + name + '_' + "warped.jpg"
            # cv2.imwrite(warp_path, warped)

            print("Finished")

            # f1 = open(warp_path, "rb")
            # res1 = f1.read()
            # warped = base64.b64encode(res1)

            f2 = open(out_path, "rb")
            res2 = f2.read()
            generated = base64.b64encode(res2)

            return generated
    return json.dumps(return_dict)



if __name__=="__main__":
    # server = pywsgi.WSGIServer(('0.0.0.0', 8015), app)
    # server.serve_forever()
    app.run(debug=1,host="0.0.0.0", port=8015, threaded=True)


