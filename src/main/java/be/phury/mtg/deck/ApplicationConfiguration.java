package be.phury.mtg.deck;

import org.apache.commons.lang3.builder.ToStringBuilder;

/**
 * Created by Phury
 */
//@Configuration
//@ConfigurationProperties
//@ConfigurationProperties(prefix="app.mtgdeck")
public class ApplicationConfiguration {

    private String version;
    private Mongo mongo;

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public Mongo getMongo() {
        return mongo;
    }


    @Override
    public String toString() {
        return ToStringBuilder.reflectionToString(this);
    }

    public static class Mongo {
        // TODO: mask password in toString()
        private String dbuser;
        private String dbpassword;
        private String hostName;
        private int port;
        private String dbName;

        public String getDbuser() {
            return dbuser;
        }

        public void setDbuser(String dbuser) {
            this.dbuser = dbuser;
        }

        public String getDbpassword() {
            return dbpassword;
        }

        public void setDbpassword(String dbpassword) {
            this.dbpassword = dbpassword;
        }

        public String getHostName() {
            return hostName;
        }

        public void setHostName(String hostName) {
            this.hostName = hostName;
        }

        public int getPort() {
            return port;
        }

        public void setPort(int port) {
            this.port = port;
        }

        public String getDbName() {
            return dbName;
        }

        public void setDbName(String dbName) {
            this.dbName = dbName;
        }

        @Override
        public String toString() {
            return ToStringBuilder.reflectionToString(this);
        }
    }

}
