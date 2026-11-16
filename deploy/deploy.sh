#!/bin/bash
# ============================================================
# Blog 后台管理系统 - 部署脚本
# ------------------------------------------------------------
# 用法：在服务器上执行
#   cd /opt/blog-admin && bash deploy/deploy.sh
# 说明：拉代码 → 装依赖 → 构建 → 替换线上目录 → 重载 Nginx
# ============================================================

set -e

APP_DIR=/opt/blog-admin
DIST_DIR=/opt/blog-admin/dist
BACKUP_DIR=/opt/blog-admin-backup

echo "==> 1/4 拉取最新代码"
cd "$APP_DIR"
git pull --ff-only

echo "==> 2/4 安装依赖"
npm install --no-audit --no-fund

echo "==> 3/4 构建"
npm run build

echo "==> 4/4 替换线上文件"
if [ -d "$DIST_DIR" ]; then
    rm -rf "$BACKUP_DIR"
    cp -r "$DIST_DIR" "$BACKUP_DIR"
fi
rm -rf "$DIST_DIR"
cp -r "$APP_DIR/dist" "$DIST_DIR"

echo "==> 重载 Nginx"
nginx -t && nginx -s reload

echo ""
echo "部署完成。访问 https://admin.qisui.asia 看看"
