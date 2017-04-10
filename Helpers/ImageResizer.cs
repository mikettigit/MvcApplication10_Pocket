using System.Drawing;
using System.IO;

namespace MvcApplication10.Helpers
{
    public static class ImageResizer
    {
        public static void Proceed43(string filename, string newfilename, int DefaultWidth = 650)
        {
            FileInfo file = new FileInfo(filename);
            System.Drawing.Image img = null;
            System.Drawing.Image objImage = System.Drawing.Image.FromFile(filename);

            int w = (int)((float)objImage.Height * 4 / 3);
            if (w > objImage.Width)
            {
                img = ScaleImage(objImage, w, objImage.Height);
                objImage.Dispose();
                img.Save(newfilename);
                objImage = img;
            }
            if (objImage.Width > DefaultWidth)
            {
                int h = (int)((float)objImage.Height * DefaultWidth / (float)objImage.Width);
                img = ScaleImage(objImage, DefaultWidth, h);
                objImage.Dispose();
                img.Save(newfilename);
                objImage = img;
            }
        }

        public static void Proceed(string filename, string newfilename, int width, int height)
        {
            FileInfo file = new FileInfo(filename);
            System.Drawing.Image img = null;
            System.Drawing.Image objImage = System.Drawing.Image.FromFile(filename);

            img = ScaleImage(objImage, width, height);

            img.Save(newfilename);
        }

        private static Image ScaleImage(Image source, int width, int height)
        {

            Image dest = new Bitmap(width, height);
            using (Graphics gr = Graphics.FromImage(dest))
            {
                gr.FillRectangle(Brushes.White, 0, 0, width, height);  // Очищаем экран
                gr.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;

                float srcwidth = source.Width;
                float srcheight = source.Height;
                float dstwidth = width;
                float dstheight = height;

                if (srcwidth <= dstwidth && srcheight <= dstheight)  // Исходное изображение меньше целевого
                {
                    int left = (width - source.Width) / 2;
                    int top = (height - source.Height) / 2;
                    gr.DrawImage(source, left, top, source.Width, source.Height);
                }
                else if (srcwidth / srcheight > dstwidth / dstheight)  // Пропорции исходного изображения более широкие
                {
                    float cy = srcheight / srcwidth * dstwidth;
                    float top = ((float)dstheight - cy) / 2.0f;
                    if (top < 1.0f) top = 0;
                    gr.DrawImage(source, 0, top, dstwidth, cy);
                }
                else  // Пропорции исходного изображения более узкие
                {
                    float cx = srcwidth / srcheight * dstheight;
                    float left = ((float)dstwidth - cx) / 2.0f;
                    if (left < 1.0f) left = 0;
                    gr.DrawImage(source, left, 0, cx, dstheight);
                }

                return dest;
            }
        }
    }
}