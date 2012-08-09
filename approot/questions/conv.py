import os

files = os.listdir(".")
count = 1
for file in files:
  if (file != ".DS_Store" and file != ".conv.py.swp" and file != "conv.py"):
    text = open(file,"r").read()
    print count
    info = str(count)+"\t"+text.split("\n")[0].split("\t")[0]+"_"+text.split("\n")[0].split("\t")[1]
    fw = open(file,"w")
    fw.write(info+"\n")
    for line in text.split("\n")[1:]:
      fw.write(line+"\n")
    count += 1






